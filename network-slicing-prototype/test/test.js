/* Stanford CS 251 Assignment 4

  This file provides a testing framework and a suite of tests
  for your auctions using the Ethereum VM.

  You may wish to modify this file to conduct additional tests.
  You're free to do so, though you won't be graded on this.

  N.B.: passing all of the tests in this file DOES NOT guarantee that
  your auction implementation is correct. There are many cases not tested
  here.

*/
// imports
var VM = require('ethereumjs-vm')
var Trie = require('merkle-patricia-tree')
var fs = require('fs')
var async = require('async')
var ethUtils = require('ethereumjs-util')
var Account = require('ethereumjs-account')
var Tx = require('ethereumjs-tx')
var Block = require('ethereumjs-block')
var test = require('tape')('cs251')
var crypto = require('crypto')
var solc = require('solc')

var mainContractName = "DAuctions";

// Ethereum state tree
var stateTrie = new Trie()
    // Create vm
var vm = new VM(stateTrie)

// accounts; will be populated later
// different accounts simulate multiple parties bidding on an auction
var accounts = []
    // the address of the auction contract
var createdAddress

var code = "";
// read in the Solidity code and compile it
var args = process.argv
var sourceCode = fs.readFileSync(args[2]).toString()
var compilationResults = solc.compile(sourceCode, 0) // 1 activates the optimiser

var startBalance = 100000

if ("errors" in compilationResults) {
    console.log("Compilation failed with errors:");
    console.log(compilationResults.errors);
    throw new Error("Compilation failed");
} else {
    console.log("Compiled \"" + args[2] + "\" successfully.");
}

// compiled Solidity code
var contractCode = {}
var abi = {}
for (var contractName in compilationResults.contracts) {
    code = compilationResults.contracts[contractName].bytecode
        // fix padding
    if (code.length % 2 == 1) {
        code = code + '0'
    }
    code = new Buffer(code, 'hex')
    contractCode[contractName] = code;

    abi[contractName] = {}
        // addresses of functions which will be compiled
    hashes = compilationResults.contracts[contractName].functionHashes;
    for (var functionName in hashes) {
        var n = functionName.indexOf("(");
        abi[contractName][functionName.substring(0, n)] = "0x" + hashes[functionName];
    }
}

var auctionIDs = {}

async.series([
    setup,
    function checkContractCreation(done) {
        var account = accounts[0]
        runTx({
            account: account,
            data: contractCode[mainContractName],
            to: '',
        }, function(results) {
            createdAddress = results.createdAddress
            test.assert(results.vm.return.toString('hex') !== '', 'create a contract and receive address')
        }, done)
    },

    function createVickreyAuction(done) {
        runTx({
            account: accounts[0],
            // no judge
            data: abi[mainContractName].beginVickreyAuction + uint256String(500) + nullAddress() + uint256String(10) + uint256String(10) + uint256String(5000),
        }, function(results) {
            auctionIDs.vickreyAuctionId = results.vm.return
            test.assert(results.vm.return.toString('hex') !== '', 'create a Vickrey auction and receive auction ID')
        }, done)
    },

    function submitFirstVickreyBid(done) {
        var nonce = accounts[1].bidNonce
        var value = 600
        var paddedValue = ethUtils.pad(ethUtils.toBuffer(value), 32)
        var commitment = ethUtils.sha3(Buffer.concat([nonce, paddedValue]))
        runTx({
            account: accounts[1],
            data: abi[mainContractName].commitBid + auctionIDs.vickreyAuctionId.toString('hex') + commitment.toString('hex'),
            value: 5000
        }, function(results) {
            test.assert(results.vm.return.toString('hex') !== '', 'commit first bid to Vickrey auction')
        }, done)
    },

    function submitSecondVickreyBid(done) {
        var nonce = accounts[2].bidNonce
        var value = 1000
        var paddedValue = ethUtils.pad(ethUtils.toBuffer(value), 32)
        var commitment = ethUtils.sha3(Buffer.concat([nonce, paddedValue]))
        runTx({
            account: accounts[2],
            data: abi[mainContractName].commitBid + auctionIDs.vickreyAuctionId.toString('hex') + commitment.toString('hex'),
            value: 5000
        }, function(results) {
            test.assert(results.vm.return.toString('hex') !== '', 'commit second bid to Vickrey auction')
        }, done)
    },

    function submitThirdVickreyBid(done) {
        var nonce = accounts[3].bidNonce
        var value = 800
        var paddedValue = ethUtils.pad(ethUtils.toBuffer(value), 32)
        var commitment = ethUtils.sha3(Buffer.concat([nonce, paddedValue]))
        runTx({
            account: accounts[3],
            data: abi[mainContractName].commitBid + auctionIDs.vickreyAuctionId.toString('hex') + commitment.toString('hex'),
            value: 5000,
            blockNum: 9
        }, function(results) {
            test.assert(results.vm.return.toString('hex') !== '', 'commit third bid to Vickrey auction')
        }, done)
    },

    function submitCheapskateVickreyBid(done) {
        var nonce = accounts[4].bidNonce
        var value = 1200
        var paddedValue = ethUtils.pad(ethUtils.toBuffer(value), 32)
        var commitment = ethUtils.sha3(Buffer.concat([nonce, paddedValue]))
        runTx({
            account: accounts[4],
            data: abi[mainContractName].commitBid + auctionIDs.vickreyAuctionId.toString('hex') + commitment.toString('hex'),
            value: 4000
        }, function(results) {
            test.assert(results.vm.return.toString('hex') == '', 'commit bid to Vickrey auction without deposit')
        }, done)
    },

    function submitLateVickreyBid(done) {
        var nonce = accounts[4].bidNonce
        var value = 1500
        var paddedValue = ethUtils.pad(ethUtils.toBuffer(value), 32)
        var commitment = ethUtils.sha3(Buffer.concat([nonce, paddedValue]))
        runTx({
            account: accounts[4],
            data: abi[mainContractName].commitBid + auctionIDs.vickreyAuctionId.toString('hex') + commitment.toString('hex'),
            value: 5000,
            blockNum: 10
        }, function(results) {
            test.assert(results.vm.return.toString('hex') == '', 'commit fashionably late bid to Vickrey auction')
        }, done)
    },

    function openFirstVickreyBidEarly(done) {
        var nonce = accounts[1].bidNonce
        runTx({
            account: accounts[1],
            data: abi[mainContractName].revealBid + auctionIDs.vickreyAuctionId.toString('hex') + nonce.toString('hex'),
            value: 600,
            blockNum: 9
        }, function(results) {
            test.assert(results.vm.return.toString('hex') == '', 'open first bid to Vickrey auction too early')
        }, done)
    },

    function openFirstVickreyBid(done) {
        var nonce = accounts[1].bidNonce
        runTx({
            account: accounts[1],
            data: abi[mainContractName].revealBid + auctionIDs.vickreyAuctionId.toString('hex') + nonce.toString('hex'),
            value: 600,
            blockNum: 10
        }, function(results) {
            var returnVal = resultsToAddress(results.vm.return)
            test.equal(returnVal, accounts[1].address.toString('hex'), 'open first bid to Vickrey auction')
        }, done)
    },

    function openSecondVickreyBid(done) {
        var nonce = accounts[2].bidNonce
        runTx({
            account: accounts[2],
            data: abi[mainContractName].revealBid + auctionIDs.vickreyAuctionId.toString('hex') + nonce.toString('hex'),
            value: 1000,
            blockNum: 10
        }, function(results) {
            var returnVal = resultsToAddress(results.vm.return)
            test.equal(returnVal, accounts[2].address.toString('hex'), 'open second bid to Vickrey auction')
        }, done)
    },

    function openThirdVickreyBidWrongValue(done) {
        var nonce = accounts[3].bidNonce
        runTx({
            account: accounts[3],
            data: abi[mainContractName].revealBid + auctionIDs.vickreyAuctionId.toString('hex') + nonce.toString('hex'),
            value: 700,
            blockNum: 10
        }, function(results) {
            test.assert(results.vm.return.toString('hex') == '', 'open third bid to Vickrey auction with wrong value')
        }, done)
    },

    function openThirdVickreyBidWrongValue(done) {
        var nonce = crypto.randomBytes(32)
        runTx({
            account: accounts[3],
            data: abi[mainContractName].revealBid + auctionIDs.vickreyAuctionId.toString('hex') + nonce.toString('hex'),
            value: 800,
            blockNum: 10
        }, function(results) {
            test.assert(results.vm.return.toString('hex') == '', 'open third bid to Vickrey auction with wrong nonce')
        }, done)
    },

    function openThirdVickreyBid(done) {
        var nonce = accounts[3].bidNonce
        runTx({
            account: accounts[3],
            data: abi[mainContractName].revealBid + auctionIDs.vickreyAuctionId.toString('hex') + nonce.toString('hex'),
            value: 800,
            blockNum: 10
        }, function(results) {
            var returnVal = resultsToAddress(results.vm.return)
            test.equal(returnVal, accounts[2].address.toString('hex'), 'open third bid to Vickrey auction')
        }, done)
    },

    function openBadVickreyBid(done) {
        var nonce = accounts[4].bidNonce
        runTx({
            account: accounts[4],
            data: abi[mainContractName].revealBid + auctionIDs.vickreyAuctionId.toString('hex') + nonce.toString('hex'),
            value: 1200,
            blockNum: 10
        }, function(results) {
            test.assert(results.vm.return.toString('hex') == '', 'open unsubmitted bid to Vickrey auction')
        }, done)
    },

    function checkVickreyAuctionSettled(done) {
        runTx({
                account: accounts[0],
                data: abi[mainContractName].finalize + auctionIDs.vickreyAuctionId.toString('hex'),
                blockNum: 25,
            }, function(results) {},
            function() {
                queryAllAccountBalances(function(v) {
                    test.equal(accounts[0].balance, startBalance + 800, "verify address 0 was credited in Vickrey auction")
                    test.equal(accounts[1].balance, startBalance, "verify address 1 didn't pay in Vickrey auction")
                    test.equal(accounts[2].balance, startBalance - 800, "verify address 2 was debited in Vickrey auction")
                    test.equal(accounts[3].balance, startBalance, "verify address 3 didn't pay in Vickrey auction")
                    test.equal(accounts[4].balance, startBalance, "verify address 4 didn't pay in Vickrey auction")
                    resetAccountBalances(done)
                })
            })
    },

    // add more tests here...
])
