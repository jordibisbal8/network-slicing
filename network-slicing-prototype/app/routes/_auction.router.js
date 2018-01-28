import DAuctions from '../contracts/auction_contract';
import sha3 from 'solidity-sha3';
import web3 from '../controllers/web3';

export default (app, router, auth) => {

  router.route('/auction')

    // Get all auctions.
    .get(auth,(req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getAllAuctions.call().then(addrs => {
         res.json(addrs);
       })
      })
    })

    // Method that begins a Vickrey's auction
    .post(auth, (req, res) => {
      DAuctions.deployed().then(contractInstance => {
        let upperBound = web3.toWei(req.body.upperBound, "ether"); //ether converted to wei
        contractInstance.beginVickreyAuction(upperBound, req.body.commitTime, req.body.revealTime, {from: req.user, gas:  576711, gasPrice: 0});
        // Event fired when auction begins
        let isSent = false;
        contractInstance.NewAuction().watch((error,result) => {
          if (!isSent) {
            isSent = true;
            console.log("-- result.args", result.args);
            return res.json(result.args.auctionAddr);
          }
        });
      });
    });


  router.route('/auction/commit')

  // Method that commits a bid to a specific auction
    .post(auth, (req, res) => {

      let bidDepositAmount = web3.toWei(6, "ether"); //ether converted to wei
      let hashedValue = sha3(req.body.bidValue);
      DAuctions.deployed().then(contractInstance => {
        contractInstance.commitBid(req.body.auctionAddr, hashedValue, {from: req.user, gas: 1400000, value: bidDepositAmount, gasPrice: 0});
        // Event fired when bid is committed.
        let isSent = false;
        contractInstance.NewBid().watch((error,result) => {
          if (!isSent) {
            console.log("-- result.args", result.args);
            isSent = true;
            return res.json(result.args);
          }
        });
      });
    })

  .get(auth,(req,res) => {
    DAuctions.deployed().then(contractInstance => {
      contractInstance.getAllAuctionsForCommit.call().then(auctions => {
        res.json(auctions);
      });
    })
  });

  router.route('/auction/reveal')

  // Method that reveals a bid from a specific auction
    .post(auth, (req, res) => {
      let bidValueInEther = web3.toWei(req.body.bidValue, "ether"); //ether converted to wei
      DAuctions.deployed().then(contractInstance => {
        contractInstance.revealBid(req.body.auctionAddr, req.body.bidValue, bidValueInEther, {from: req.user, gas: 1400000, gasPrice: 0});
        let isSent = false;
        contractInstance.BidRevealed().watch((error,result) => {
          if (!isSent) {
            if (result.args.isRevealed === false)
              res.send(500, { err: 'Bid Value does not match or bid higher than upper bound'});
            else {
              isSent = true;
              res.json(result.args.isRevealed);
            }
          }
        });
      });
    })

    .get(auth,(req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getAllAuctionsForReveal.call().then(auctions=> {
          res.json(auctions);
        })
      })
    });

  router.route('/auction/auctionEnded')

    // Get ended auctions where msg.sender is the owner
    .get(auth,(req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getAllEndedAuctions.call(req.user).then(addrs => {
          res.json(addrs);
        })
      })
    });


  router.route('/auction/finalize')

  // Get ended auctions where msg.sender is the owner
    .put(auth,(req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.finalize(req.body.auctionAddr, {from: req.user, gas: 1400000, gasPrice: 0});
        let isSent = false;
        contractInstance.IsFinished().watch((error,result) => {
          if (!isSent) {
            isSent = true;
            result.args.reservePrice = web3.fromWei(result.args.reservePrice, 'ether');
            return res.json(result.args);
          }
        });
      })
    });

  /*router.route('/auction/commitBids')

    .get((req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getCommitBids.call('0x296dfa7026b08ad76445a8e7f2901fadd9226ab6\n', '0xee5dcd3339385e11f8674abe2e10631b3f4f7a07').then(commitBid=> {
          console.log("-- commitBid", commitBid);
          res.json(commitBid);
        })
      })
    });

  router.route('/auction/highestBid')

    .get((req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getHighestBid.call('0x296dfa7026b08ad76445a8e7f2901fadd9226ab6\n').then(highestBid => {
          console.log("-- highestBid", highestBid);
          res.json(highestBid);
        })
      })
    });

  router.route('/auction/highestBidder')

    .get((req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getHighestBidder.call('0x296dfa7026b08ad76445a8e7f2901fadd9226ab6\n').then(highestBidder => {
          console.log("-- highestBidder", highestBidder);
          res.json(highestBidder);
        })
      })
    });*/
}

