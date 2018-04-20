import Users from '../contracts/users_evaluation_contract'
import web3 from '../controllers/web3';
import VickreyAuction from '../contracts/vickrey_auction_evaluation_contract';
import async from 'async';

export default (app, router, auth) => {

  router.route('/evaluation/peering-node')
  // Method that adds peering nodes and links of InPs
    .post(auth, (req, res) => {
      Users.deployed().then(contractInstance => {
        async.eachOf(req.body.peeringNodes, function eachNode(node, index, eachOfCallback) {
          contractInstance.addPeeringNode(node._id, node.country, node.resources.map(x => x.type),
            node.resources.map(x => x.unitary_cost), node.resources.map(x => x.capacity),
          {from: node.InP, gas: 1400000});
          let isSent = false;
          contractInstance.LogNewPeeringNode().watch((error,result) => {
            if (!isSent) {
              isSent = true;
              eachOfCallback(null);
            }
          });
          },
          function (err) {
             console.log("-- ", );
             res.json({ok: 200});
          })
      })
    });

  router.route('/evaluation/virtual-network')

    .post(auth, (req, res) => {
      Users.deployed().then(usersContract => {
        async.waterfall([
          async.constant(usersContract),
          // Get the virtual nodes matched of the InPs and creates bids
          function getMatchedVirtualNodesAndCreateBid(usersContract,callback) {
            let matchedVirtualNodes = [];
            let packagePricingInPs =[];
            async.eachOfSeries(req.body.InPs, function eachInP(InP, i, eachOfSeriesCallback) {
                usersContract.getCostsAndCapacities.call(InP, req.body.idVirtualNodes, req.body.locations, req.body.resourceTypes)
                  .then(data => {
                    let counter = 0;
                    data[0].forEach((uCosts, i) =>{
                      if (uCosts.toNumber() !== 0 && data[1][i].toNumber() + req.body.computing_demands[i] <= data[2][i].toNumber()) {
                        // (uCapacity + computing_demand) / allCapacity
                        let u = (data[1][i].toNumber() + req.body.computing_demands[i]) / data[2][i].toNumber();
                        console.log("-- uCosts.toNumber()", uCosts.toNumber());
                        let cost = (uCosts.toNumber() + (u / (1 - u))); //TODO  * req.body.lifetime
                        let individualMargin = 0; //TODO MARGINS
                        let bid = cost * (1 + individualMargin);
                        // TODO UPDATE CAPACITIES
                        if (bid <= req.body.upperBoundCosts[i]) {
                          if (matchedVirtualNodes[InP]) {
                            matchedVirtualNodes[InP].push({
                              idVirtualNode: req.body.idVirtualNodes[i],
                              resourceType: req.body.resourceTypes[i],
                              location: req.body.locations[i],
                              cost: cost,
                              bid: bid, //FOR THE BLOCKCHAIN
                            });
                            if (counter === req.body.idVirtualNodes.length - 1) {
                              let packageCost = matchedVirtualNodes[InP].map(x => x.cost).reduce((a, b) => a + b, 0);
                              let packageMargin = 0; //TODO MARGINS
                              let packageBid = packageCost * (1 + packageMargin);
                              packagePricingInPs.push({
                                InP: InP,
                                cost: packageCost,
                                bid: packageBid
                              });
                            }
                          }
                          else {
                            matchedVirtualNodes[InP] = [{
                              idVirtualNode: req.body.idVirtualNodes[i],
                              resourceType: req.body.resourceTypes[i],
                              location: req.body.locations[i],
                              cost: cost,
                              bid: bid,
                            }];
                          }
                          counter ++;
                        }
                      }
                    });
                    eachOfSeriesCallback(null);
                  })
              },
              function(err)
              {
                console.log("-- allowedVirtualNodes", matchedVirtualNodes);
                console.log("-- packagePricingInPs", packagePricingInPs);
                callback(err, matchedVirtualNodes, packagePricingInPs);
              });
          },

          // Creates the vickrey contract and adds the allowed InPs
          function createContract(matchedVirtualNodes, packagePricingInPs, callback) {
            VickreyAuction.new(req.body.idVirtualNodes, req.body.resourceTypes, req.body.locations, req.body.upperBoundCosts, req.body.capacities,
              req.body.idLinks, req.body.from, req.body.to, req.body.dBandwidth, {from: req.user, gas: 4000000})
              .then(vickreyContract => {
                console.log("-- result.contract.address", vickreyContract.contract.address);
                  callback(null, vickreyContract.contract.address, matchedVirtualNodes, packagePricingInPs);
              })
          },
          function bidding(auctionAddr, matchedVirtualNodes, packagePricingInPs, callback) {
            let vickreyContract = VickreyAuction.at(auctionAddr);
            async.eachOfSeries(req.body.InPs, function eachInP(InP, i, eachOfCallback) {
                if (typeof matchedVirtualNodes[InP] === "undefined") {
                return eachOfCallback(null);
              }
              if (packagePricingInPs.length === 0 || packagePricingInPs.map(x => x.InP).indexOf(InP) === -1) {
                let ids = matchedVirtualNodes[InP].map(x => x.idVirtualNode);
                let values = matchedVirtualNodes[InP].map(x => x.bid);
                vickreyContract.commitIndividualBids(ids, values, {from: InP, gas: 1400000}).then(res => {
                  return eachOfCallback();
                })
              }
              else {
                vickreyContract.commitPackageBid(packagePricingInPs.map(x => x.bid), {from: InP, gas: 1400000}).then(res => {
                  return eachOfCallback();
                })
              }
            },
              function(err) {
                callback(err, vickreyContract)
              });
          },
          // Partitioning
          function getBidsPerVirtualNode (vickreyContract, callback) {
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
                callback(err, individualBids, individualNotCompleted, indInPs, vickreyContract);
              });
          },
          function getPackageBids(individualBids, individualNotCompleted, indInPs, vickreyContract, callback) {
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
              callback(null, individualBids, individualNotCompleted, indInPs, packageBid, packageInPs, packageNotExist, vickreyContract);
            });
          },
          function compareIndividualAndPackageBids(individualBids, individualNotCompleted, indInPs, packageBid, packageInPs, packageNotExist, vickreyContract, callback) {
            console.log("-- individualBids", individualBids);
            console.log("-- packageBid", packageBid);
            console.log("-- packageInPs", packageInPs);
            let sum = individualBids.map(x => x.reservedPrice).reduce((a, b) => a + b, 0);
            // package pricing wins
            if ((individualNotCompleted ||  packageBid.reservedPrice <= sum) && !packageNotExist) {
              vickreyContract.addPackageWinnersAndBids(packageBid.reservedPrice, packageBid.InP, {from: req.user, gas: 1400000});
              let isSent = false;
              vickreyContract.LogEnded().watch((error, result) => {
                if (!isSent) {
                  isSent = true;
                  return callback(null, packageBid, null, vickreyContract);
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
                  isSent = true;
                  return callback(null, null, individualBids, vickreyContract);
                }
              })
            }
            else {
              callback('No solution exists')
            }
          },
          function updateInPsCapacities(packageBid, indBids, vickreyContract, callback) {
            updateCapacitiesInPs(vickreyContract,packageBid,indBids, true, req, (res) => {
              callback(null, packageBid, indBids,vickreyContract);
            })

          },
          function lifeTimeEnded (packageBid, indBids, vickreyContract, callback) {
            setTimeout(updateCapacitiesInPs, req.body.lifetime, vickreyContract, packageBid, indBids, false, req, () => {
              callback(null, packageBid, indBids,vickreyContract);
            });
          }
        ], (err) => {
          if (err) return res.send(500, err);
          res.json({ok: 200});
        })
      })
    });

  function updateCapacitiesInPs(vickreyContract, packageBid, indBids, isSum, req, callback) {
    console.log("-- SUUUUU", 'SUUUUU');
    if (packageBid) {
      vickreyContract.updateCapacities(req.body.computing_demands, req.body.resourceTypes, req.body.locations, isSum,
        {from: packageBid.InP, gas: 1400000});
      callback(null, packageBid, indBids,vickreyContract);
    }
    else {
      async.eachOf(req.body.indBids, function eachBid(bid, index, eachOfCallback) {
          let i = req.body.idVirtualNodes.indexOf(bid.idVirtualNode);
          vickreyContract.updateCapacity(req.body.computing_demands[i], req.body.resourceTypes[i], req.body.locations[i], isSum,
            {from: bid.InP, gas: 1400000}).then(res => {
            eachOfCallback(null);
          })
        },
        function(err)
        {
          callback(err);
        });
    }
  }
}
