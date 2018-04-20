import Users from '../contracts/users_contract'
import web3 from '../controllers/web3';
import async from 'async';
export default (app, router, auth) => {

  router.route('/user')

  // Get all the users
    .get((req, res) => {
      Users.deployed().then(contractInstance => {
        contractInstance.getAllUsers.call().then(addr => {
          res.json(addr);
        })
      })
    })
    // Method that registers an user
    .post((req, res) => {
      Users.deployed().then(contractInstance => {
        contractInstance.insertUser(req.body.address, req.body.email, req.body.role, req.body.name,
          {from: req.body.address, gas: 1400000});
        // Event fired when the user is added
        let isSent = false;
        contractInstance.LogNewUser().watch((error, result) => {
          if (!isSent) {
            isSent = true;
            console.log("-- result.args", result.args);
            res.sendStatus(200);
          }
        });
        contractInstance.LogErrors().watch((error, result) => {
          res.status(405).send('User already exists in the Blockchain');
        })
      });
    });

  router.route('/user/peering-node')

  // Method that gets peeringNodes and links of an InP
    .get(auth,(req, res) => {
      let peeringNodes = [];
      let peeringLinks = [];
      Users.deployed().then(contractInstance => {
        async.waterfall([
          async.constant(contractInstance),
          function getPeeringNodes(contractInstance, callback) {
            contractInstance.getPeeringNodes.call({from: req.user}).then(nodes => {
              callback(null, nodes);
            });
          },
          function getSubstrateNodesForAllPeeringNodes(nodes, callback) {
            async.eachOfSeries(nodes[0], function eachPeeringNode(idPeeringNode, index, eachOfSeriesCallback) {
              async.waterfall([
                function getPeeringLinks(callback) {
                  contractInstance.getPeeringLink.call(idPeeringNode, {from: req.user}).then(links => {
                    for (let j = 0; j < links[0].length; j++) {
                      if (web3.toUtf8(links[0][j]))
                        peeringLinks.push({id: web3.toUtf8(links[0][j]), from: web3.toUtf8(links[1][j]), to: web3.toUtf8(links[2][j]),
                          capacity: links[3][j].toNumber(), label: links[3][j].toNumber()
                          });
                    }
                    callback(null);
                  })
                },
                function getResourceTypes(callback) {
                  contractInstance.getResourceTypes.call(idPeeringNode, {from: req.user}).then(subNodes => {
                    let resources = [];
                    for (let j = 0; j < subNodes.length; j++) {
                      resources.push(web3.toUtf8(subNodes[j]));
                    }
                    // create peeringNode object
                    peeringNodes.push({
                      id: web3.toUtf8(idPeeringNode), location: web3.toUtf8(nodes[1][index]),
                      x: nodes[2][index].toNumber(), y: nodes[3][index].toNumber(), resources: resources
                    });
                    callback(null);
                  });
                }
              ], (err) => {
                eachOfSeriesCallback(err);
              });
            },
            function(err)
            {
              callback(err, peeringNodes);
            });
        },
        ], (err, peeringNodes) => {
          if (err) return err;
          res.json({peeringNodes: peeringNodes, peeringLinks: peeringLinks});
        })
      })
    })

    // Method that adds peering nodes and links of an InP
    .post(auth, (req, res) => {
      Users.deployed().then(contractInstance => {
        async.parallel([
          function postPeeringNodes(callback) {
            async.eachOf(req.body.idNodes, function eachNode(node, i, eachOfCallback) {
                contractInstance.addPeeringNode(node, req.body.locations[i],
                  parseInt(req.body.x[i]), parseInt(req.body.y[i]), req.body.resourceTypes[i][0],
                  {from: req.user, gas: 1400000});
                let isSent = false;
                contractInstance.LogNewPeeringNode().watch((error,result) => {
                  if (!isSent) {
                    isSent = true;
                    eachOfCallback();
                  }
                });
              },
              function(err)
              {
                callback(err);
              });
          },

          function postLinks(callback) {
            contractInstance.addPeeringLinks(req.body.idLinks, req.body.from, req.body.to, req.body.capacities,
              {from: req.user, gas: 1400000});
            // Event fired when the user is added
            let isSent = false;
            contractInstance.LogNewLinks().watch((error, result) => {
              if (!isSent) {
                isSent = true;
                callback(error);
              }
            });
          },
        ],
        function(err, results) {
          if (err) return err;
          res.json({ok: 200});
        });
      });
    });

  router.route('/user/auctions')

  // Method that gets auctions from a user
    .get(auth, (req, res) => {
      Users.deployed().then(usersContract => {
        usersContract.getUserAuctions.call({from: req.user, gas: 3000000}).then((auctionsData) => {
          let auctions = [];
          auctionsData[0].forEach((auctionAddr, i) => {
            auctions.push({auctionAddr: auctionAddr, isOpened: auctionsData[1][i], endTime: auctionsData[2][i]});
          });
          res.json({auctions: auctions});
        })
      })
    })

}
