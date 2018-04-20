import VickreyAuction from '../contracts/vickrey_auction_contract';
import Users from '../contracts/users_contract';
import web3 from '../controllers/web3';
import async from 'async';
import codegrid from 'codegrid-js';

export default (app, router, auth) => {

  router.route('/virtual-network')

    // Method that starts the auction of a virtual network
    .post(auth, (req, res) => {
        Users.deployed().then(usersContract => {
        async.waterfall([
          async.constant(usersContract),

          // Get all InPs
          function getInPs(usersContract, callback)  {
            usersContract.getInPs.call().then(users => {
              console.log("-- users", users);
              let InPs = [];
              users.forEach(user => {
                if (user !== '0x0000000000000000000000000000000000000000')
                  InPs.push(user);
              });
              callback(null, InPs);
            });
          },

          // Get the virtual nodes matched of the InPs
          function getMatchedVirtualNodes(InPs, callback) {
            let allowedInPs = [];
            let allowedVirtualNodes = [];
            let packagePricingInPs =[];
            async.eachOfSeries(InPs, function eachInP(InP, i, eachOfSeriesCallback) {
              usersContract.getMatchedVirtualNodes.call(InP, req.body.idVirtualNodes, req.body.locations, req.body.resourceTypes)
                .then(data => {
                  let counter = 0;
                  data.forEach((idVirtualNode) =>{
                    if (web3.toUtf8(idVirtualNode)) {
                      if (counter === req.body.idVirtualNodes.length - 1) {
                        allowedVirtualNodes = allowedVirtualNodes.slice(0, allowedVirtualNodes.length - counter);
                        allowedInPs = allowedInPs.slice(0, allowedInPs.length - counter);
                        packagePricingInPs.push(InP);
                      }
                      else {
                        allowedInPs.push(InP);
                        allowedVirtualNodes.push(web3.toUtf8(idVirtualNode));
                        counter ++;
                      }
                    }
                  });
                eachOfSeriesCallback(null);
              })
            },
            function(err)
            {
              callback(err, allowedInPs, allowedVirtualNodes, packagePricingInPs);
            });
          },

          // Creates the vickrey contract and adds the allowed InPs
          function createContract(allowedInPs, allowedVirtualNodes, packagePricingInPs, callback) {
            console.log("-- allowedInPs", allowedInPs);
            console.log("-- allowedVirtualNodes", allowedVirtualNodes);
            console.log("-- packagePricingInPs", packagePricingInPs);
            VickreyAuction.new(req.body.idVirtualNodes, req.body.resourceTypes, req.body.locations, req.body.upperBoundCosts,
              req.body.x, req.body.y, req.body.idLinks, req.body.from, req.body.to, req.body.dBandwidth, req.body.endTime, {from: req.user, gas: 4000000})
              .then(vickreyContract => {
                console.log("-- result.contract.address", vickreyContract.contract.address);
                vickreyContract.addAllowedInPs(allowedInPs, allowedVirtualNodes,packagePricingInPs, {from: req.user, gas: 4000000}).then(res => {
                  callback(null, vickreyContract.contract.address, allowedInPs, packagePricingInPs);
                });
              })
          },

          // Add auction address to User
          function addAuctionAddr(auctionAddr, allowedInPs, packagePricingInPs, callback) {
            // delete repeated InPs
            let InPs = allowedInPs.filter((value, index) => {
              return allowedInPs.indexOf(value) === index;
            });
            InPs = InPs.concat(packagePricingInPs);
            console.log("-- InPs", InPs);
            // TODO TOO SLOW
            usersContract.addOpenedAuction(InPs, auctionAddr, req.body.endTime, {from: req.user, gas: 1400000});
            let isSent = false;
            usersContract.LogAuctionOpened().watch((error,result) => {
              if (!isSent) {
                isSent = true;
                callback(null, auctionAddr);
              }
            })
          },
      ], (err, auctionAddr) => {
          if (err) return err;
          res.json({auctionAddr: auctionAddr});
        })
      })
    });

  router.route('/virtual-network/:auctionAddr')

    .get(auth, (req, res) => {
      let vickreyContract = VickreyAuction.at(req.params.auctionAddr);
      let virtualNodes= [];
      let virtualLinks = [];
      async.waterfall([
        async.constant(vickreyContract),
        function getVirtualNodes(vickreyContract, callback) {
          vickreyContract.getVirtualNodes.call({from: req.user}).then(nodes => {
            for (let i = 0; i < nodes[0].length; i++) {
              virtualNodes.push({
                id: web3.toUtf8(nodes[0][i]), location: web3.toUtf8(nodes[1][i]),
                x: nodes[2][i].toNumber(), y: nodes[3][i].toNumber(),
                type: web3.toUtf8(nodes[4][i]), upperBoundCost: nodes[5][i].toNumber()
              });
            }
            callback(null, virtualNodes);
          });
        },
        function getLinksAndAllowedInps(virtualNodes, callback) {
          async.eachOfSeries(virtualNodes, function eachVirtualNode(virtualNode, index, eachOfSeriesCallback) {
              async.parallel([
                  function getLinks(callback) {
                    vickreyContract.getVirtualLinks.call(virtualNode.id, {from: req.user}).then(links => {
                      for (let i = 0; i < links[0].length; i++) {
                        if (web3.toUtf8(links[0][i]))
                          virtualLinks.push({
                            id: web3.toUtf8(links[0][i]), from: web3.toUtf8(links[1][i]),
                            to: web3.toUtf8(links[2][i]), dBandwidth: links[3][i].toNumber()
                          });
                      }
                      callback();
                    })
                  },

                  function getAllowedInPsPerVirtualNode(callback) {
                    vickreyContract.getAllowedInPsPerVirtualNode.call(virtualNode.id, {from: req.user}).then(InPs => {
                      virtualNode.InPs = InPs;
                      callback();
                    })
                  },
                ],
                function(err, results) {
                  eachOfSeriesCallback();
                });
            },
            function(err)
            {
              callback(err);
            });
        },
        function getIsOwner(callback) {
          vickreyContract.owner.call().then(owner=> {
            callback(null, owner);
          })
        },
        function getAllowedInPPackage(owner, callback) {
          vickreyContract.isPackageAllowed({from: req.user}).then(isPackageAllowed => {
            callback(null, owner, isPackageAllowed);
          })
        },
        function hasEnded(owner, isPackageAllowed, callback) {
          vickreyContract.ended.call().then(hasEnded => {
            if (hasEnded) {
              vickreyContract.packageWinner.call().then(winner => {
                console.log("-- winner", winner);
                if (winner !== '0x0000000000000000000000000000000000000000') {
                  vickreyContract.reservedPackagePrice.call().then(value => {
                    callback(null, owner, isPackageAllowed, null, hasEnded, winner, value.toNumber());
                  })
                }
                else {
                  vickreyContract.getIndividualWinnersAndBids.call().then(data => {
                    data[1].forEach((idVirtualNodes, i) => {
                      let index = virtualNodes.map(x => x.id).indexOf(web3.toUtf8(idVirtualNodes));
                      virtualNodes[index].winner = data[0][i];
                      virtualNodes[index].reservedPrice = data[2][i];
                    });
                    callback(null, owner, isPackageAllowed, null, hasEnded, null, null);
                  })
                }
              })
            }
            else {
              vickreyContract.endTime.call({from: req.user}).then(endTime => {
                callback(null, owner, isPackageAllowed, endTime, hasEnded, null, null);
              })
            }
          })
        }
      ], (err, owner, isPackageAllowed, endTime, hasEnded, packageWinner, reservedPackagePrice) => {
        if (err) return err;
        res.json({virtualNodes: virtualNodes, virtualLinks: virtualLinks,
          isPackageAllowed: isPackageAllowed, owner: owner, endTime: endTime,
          hasEnded: hasEnded, packageWinner: packageWinner, reservedPackagePrice: reservedPackagePrice
        });
      })
    });

  router.route('/virtual-network/bidding')

    .post(auth, (req, res) => {
      let vickreyContract = VickreyAuction.at(req.body.auctionAddr);
      vickreyContract.commitIndividualBids(req.body.idVirtualNodes, req.body.values, {from: req.user, gas: 1400000});
      let isSent = false;
      vickreyContract.LogError().watch((error,result) => {
        if (!isSent) {
          console.log("-- result", result.args);
          isSent = true;
          return res.send(500, web3.toUtf8(result.args.message));
        }
      });
      vickreyContract.LogIndividualBids().watch((error,result) => {
        if (!isSent) {
          console.log("-- result.args", result.args.values[0].toNumber());
          isSent = true;
          return res.json({ok: 200});
        }
      });
    });

  router.route('/virtual-network/package-bidding')

    .post(auth, (req, res) => {
      let vickreyContract = VickreyAuction.at(req.body.auctionAddr);
      vickreyContract.commitPackageBid(req.body.value, {from: req.user, gas: 1400000});
      let isSent = false;
      vickreyContract.LogError().watch((error,result) => {
        if (!isSent) {
          console.log("-- result.args1", result.args);
          isSent = true;
          return res.send(500, web3.toUtf8(result.args.message));
        }
      });
      vickreyContract.LogPackageBid().watch((error, result) => {
        if (!isSent) {
          console.log("-- result.args", result.args.value.toNumber());
          isSent = true;
          res.json({ok: 200});
        }
      })
    });


  router.route('/virtual-network/partitioning')
    .post(auth, (req, res) => {
      let vickreyContract = VickreyAuction.at(req.body.auctionAddr);
      async.waterfall([
        async.constant(vickreyContract),

        function getBidsPerVirtualNode(vickreyContract, callback) {
          let individualBids = [];
          let individualNotCompleted;
          let indInPs = [];
          async.eachOf(req.body.idVirtualNodes, function eachVirtualNode(idVirtualNode, i, eachOfCallback) {
            vickreyContract.getBidsPerVirtualNode.call(idVirtualNode, {from: req.user}).then(InPsAndBids => {
              if (InPsAndBids[0].length === 0) {
                individualBids[i] = {idVirtualNode:idVirtualNode, reservedPrice: 0};
                individualNotCompleted = true;
              }
              else {
                individualBids[i] = {idVirtualNode:idVirtualNode};
                InPsAndBids[1].forEach((value, index) => {
                  if (indInPs.indexOf(InPsAndBids[0][index]) === -1)
                    indInPs.push(InPsAndBids[0][index]);
                  // If first bid
                  if (!individualBids[i].lowestBid){
                    individualBids[i].reservedPrice = value.toNumber();
                    individualBids[i].lowestBid = value.toNumber();
                    individualBids[i].InP = InPsAndBids[0][index];
                  }
                  else {
                    // If lowest bid
                    if (value.toNumber() < individualBids[i].lowestBid) {
                      individualBids[i].reservedPrice = individualBids[i].lowestBid;
                      individualBids[i].lowestBid = value.toNumber();
                      individualBids[i].InP = InPsAndBids[0][index];
                    }
                    // If bigger than lowest bid but smaller than reserved price
                    else if (individualBids[i].lowestBid === individualBids[i].reservedPrice ||
                      value.toNumber() < individualBids[i].reservedPrice) {
                      individualBids[i].reservedPrice = value.toNumber();
                    }
                    else {
                      // do nothing
                    }
                  }
                });
              }
              eachOfCallback();
            })
            },
            function(err)
            {
              callback(err, individualBids, individualNotCompleted, indInPs);
            });
        },

        function getPackageBids(individualBids, individualNotCompleted, indInPs, callback) {
          let packageInPs = [];
          let packageNotExist;
          vickreyContract.getPackageBids.call({from: req.user}).then(InPsAndBids => {
            let packageBid = {};
            if (InPsAndBids[0].length === 0) {
              packageNotExist = true;
            }
            else {
              InPsAndBids[1].forEach((value, index) => {
                if (packageInPs.indexOf(InPsAndBids[0][index]) === -1)
                  packageInPs.push(InPsAndBids[0][index]);
                if (!packageBid.lowestBid){
                  packageBid.reservedPrice = value.toNumber();
                  packageBid.lowestBid = value.toNumber();
                  packageBid.InP = InPsAndBids[0][index];
                }
                else {
                  if (value.toNumber() < packageBid.lowestBid) {
                    packageBid.reservedPrice = packageBid.lowestBid;
                    packageBid.lowestBid = value.toNumber();
                    packageBid.InP = InPsAndBids[0][index];
                  }
                  // If bigger than lowest bid but smaller than reserved price
                  else if (packageBid.lowestBid === packageBid.reservedPrice ||
                    value.toNumber() < packageBid.reservedPrice) {
                    packageBid.reservedPrice = value.toNumber();
                  }
                  else {
                    // do nothing
                  }
                }
              });
            }
            callback(null, individualBids, individualNotCompleted, indInPs, packageBid, packageInPs, packageNotExist);
          });
        },

        function compareIndividualAndPackageBids(individualBids, individualNotCompleted, indInPs, packageBid, packageInPs, packageNotExist, callback) {
          console.log("-- individualBids", individualBids);
          console.log("-- packageBid", packageBid);
          console.log("-- packageInPs", packageInPs);
          console.log("-- individualNotCompleted", individualNotCompleted);
          console.log("-- packageNotExist", packageNotExist);
          let sum = individualBids.map(x => x.reservedPrice).reduce((a, b) => a + b, 0);
          console.log("-- sum", sum);
          // package pricing wins
          if ((individualNotCompleted ||  packageBid.reservedPrice <= sum) && !packageNotExist) {
            vickreyContract.addPackageWinnersAndBids(packageBid.reservedPrice, packageBid.InP, {from: req.user, gas: 1400000});
            let isSent = false;
            vickreyContract.LogEnded().watch((error, result) => {
              if (!isSent) {
                console.log("-- result.args", result.args);
                isSent = true;
                return callback(null, packageInPs, indInPs);
              }
            })
          }
          // individualVirtualNodes
          else if (!individualNotCompleted) {
            let idVirtualNodes = [];
            let reservedPrices = [];
            let InPs = [];
            individualBids.map(x => {
              idVirtualNodes.push(x.idVirtualNode);
              reservedPrices.push(x.reservedPrice);
              InPs.push(x.InP);
            });
            vickreyContract.addIndividualWinnersAndBids(idVirtualNodes, reservedPrices, InPs, {from: req.user, gas: 1400000});
            let isSent = false;
            vickreyContract.LogEnded().watch((error, result) => {
              if (!isSent) {
                console.log("-- result.args1", result.args);
                isSent = true;
                return callback(null, packageInPs, indInPs);
              }
            })
          }
          else {
            callback('No solution exists')
          }
        },

        function closeAuction(packageInPs, indInPs, callback) {
          Users.deployed().then(usersContract => {
            console.log("-- packageInPs.concat(indInPs)", packageInPs.concat(indInPs));
            usersContract.closeAuction(packageInPs.concat(indInPs), req.body.auctionAddr, {from: req.user, gas: 1400000});
            let isSent = false;
            usersContract.LogAuctionDeleted().watch((error,result) => {
              if (!isSent) {
                isSent = true;
                callback(null);
              }
            })
          });
        }

      ], (err) => {
        if (err) return res.send(500, err);
        res.json({ok: 200});
      })
    });
}
