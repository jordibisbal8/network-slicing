import DAuctions from '../contracts/auction_contract';
import web3 from '../controllers/web3';
import sha3 from 'solidity-sha3';

export default (app, router, auth) => {

  router.route('/auction')

    // Get all open auctions.
    .get(auth,(req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getAllOpenAuctions.call().then(addrs => {
         res.json(addrs);
       })
      })
    })

    // Method that begins a Vickrey's auction
    .post(auth, (req, res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.beginVickreyAuction(500, req.body.commitTime, req.body.revealTime, 500, {from: req.user, gas: 1400000}).then(response => {
          res.sendStatus(200);
        })
      });
    });


  router.route('/auction/commit')

  // Method that commits a bid to a specific auction
    .post(auth, (req, res) => {
      let hashedValue = sha3(600);
      DAuctions.deployed().then(contractInstance => {
        contractInstance.commitBid(req.body.auctionIndex, hashedValue, {from: req.user, gas: 1400000, value: 501});
        // Event fired when bid is committed.
        contractInstance.NewBid().watch((error,result) => {
          console.log("-- result.args", result.args);
          res.sendStatus(200);
        });
      });
    })

  .get((req,res) => {
    DAuctions.deployed().then(contractInstance => {
      contractInstance.getCommitBids.call(0).then(commits=> {
        res.json(commits);
      })
    })
  });

  router.route('/auction/reveal')

  // Method that reveals a bid from a specific auction
    .post(auth, (req, res) => {
      console.log("-- req.body.auctionIndex", req.body.auctionIndex);
      DAuctions.deployed().then(contractInstance => {
        contractInstance.revealBid(req.body.auctionIndex, {from: req.user, gas: 1400000, value: 600});
        contractInstance.BidRevealed().watch((error,result) => {
          console.log("-- result.args", result.args);
          res.sendStatus(200);
        });
      });
    });

  router.route('/auction/highestBid')

    .get((req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getHighestBid.call(0).then(highestBid => {
          console.log("-- highestBid", highestBid);
          res.json(highestBid);
        })
      })
    });

  router.route('/auction/highestBidder')

    .get((req,res) => {
      DAuctions.deployed().then(contractInstance => {
        contractInstance.getHighestBidder.call(0).then(highestBidder => {
          console.log("-- highestBidder", highestBidder);
          res.json(highestBidder);
        })
      })
    });
}

// TODO REVEAL A BID
// TODO FINALIZE
