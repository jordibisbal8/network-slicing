import Users from '../contracts/users_evaluation_contract'
import web3 from '../controllers/web3';
import VickreyAuction from '../contracts/vickrey_auction_evaluation_contract';
import async from 'async';
import fs from 'fs';
var csv = require('csv');

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

    .post((req, res) => {
      Users.deployed().then(usersContract => {
        async.waterfall([
          async.constant(usersContract),
          // Get the virtual nodes matched of the InPs and creates bids
          function getMatchedVirtualNodesAndCreateBid(usersContract,callback) {
            let matchedVirtualNodes = [];
            let packagePricingInPs =[];
            async.eachOfSeries(req.body.InPs, function eachInP(InP, j, eachOfSeriesCallback) {
                usersContract.getCostsAndCapacities.call(req.body.locations, req.body.resourceTypes, {from: InP, gas: 1400000})
                  .then(data => {
                    let counter = 0;
                    data[0].forEach((uCosts, i) => {
                      if (uCosts.toNumber() !== 0 && data[1][i].toNumber() + req.body.computing_demands[i] < data[2][i].toNumber()) {
                        // (uCapacity + computing_demand) / allCapacity
                        let u = (data[1][i].toNumber() + req.body.computing_demands[i]) / data[2][i].toNumber();
                        console.log("-- InP", InP);
                        console.log("-- usedCapacity", data[1][i].toNumber());
                        //console.log("-- u", u);
                        let cost = (uCosts.toNumber() + (u / (1 - u)));
                        let individualMargin;
                        let packageMargin;
                        if (InP ==='0xde501181911262542393beb7298b2f22e7c64416') {
                          individualMargin = 0.1; //10%
                          packageMargin = 0.1; //10%
                        }
                        if  (InP === '0xd358821084f42c7e60ae0ca89b4337eb0cb24bb0') {
                          individualMargin = 0.2; //20%
                          packageMargin = 0.2; //20%
                        }
                        if  (InP === '0xa18a26a37141f10f5874a30237dac76dd8994bdb') {
                          individualMargin = 0.4; //40%
                          packageMargin = 0.4; //20%

                        }
                        console.log("-- cost", cost);
                        let bid = cost * (1 + individualMargin);
                        if (bid <= req.body.upperBoundCosts[i]) {
                          if (matchedVirtualNodes[InP]) {
                            matchedVirtualNodes[InP].push({
                              idVirtualNode: req.body.idVirtualNodes[i],
                              resourceType: req.body.resourceTypes[i],
                              location: web3.toUtf8(data[3][i]),
                              cost: cost,
                              bid: bid,
                              InP: InP,

                            });
                            if (counter === req.body.idVirtualNodes.length - 1) {
                              let packageCost = matchedVirtualNodes[InP].map(x => x.cost).reduce((a, b) => a + b, 0);
                              let packageBid = packageCost * (1 + packageMargin);
                              packagePricingInPs.push({
                                InP: InP,
                                cost: packageCost,
                                bid: packageBid,
                              });
                              matchedVirtualNodes[InP] = [];
                            }
                          }
                          else {
                            matchedVirtualNodes[InP] = [{
                              idVirtualNode: req.body.idVirtualNodes[i],
                              resourceType: req.body.resourceTypes[i],
                              location: web3.toUtf8(data[3][i]),
                              cost: cost,
                              bid: bid,
                              InP: InP,
                            }];
                          }
                          /*usersContract.updateCapacity(req.body.computing_demands[i], req.body.resourceTypes[i], req.body.locations[i], true,
                            {from: InP, gas: 1400000}).then(res => {
                          });*/
                          counter ++;
                        }
                      }
                    });
                    eachOfSeriesCallback(null);
                  })
              },
              function(err)
              {
                //console.log("-- matchedVirtualNodes", matchedVirtualNodes);
                //console.log("-- packagePricingInPs", packagePricingInPs);
                callback(err, matchedVirtualNodes, packagePricingInPs, usersContract);
              });
          },

          function getBidsPerVirtualNode(matchedVirtualNodes, packagePricingInPs, usersContract, callback) {
            let individualBids = [];
            let packageBid = [];
            let notWinningBids = [];
            let notWinningPackageBids = [];
            // Gets bids per virtual node
            req.body.idVirtualNodes.forEach((idVirtualNode) => {
              for (let i in matchedVirtualNodes) {
                let index = matchedVirtualNodes[i].map(x => x.idVirtualNode).indexOf(idVirtualNode);
                if (index > -1) {
                  let j = individualBids.map(x => x.idVirtualNode).indexOf(idVirtualNode);
                  if (j > -1) {
                    if (matchedVirtualNodes[i][index].bid < individualBids[j].bid) {
                      notWinningBids.push({idVirtualNode: individualBids[j].idVirtualNode, InP: individualBids[j].InP});
                      individualBids[j].reservedPrice = individualBids[j].bid;
                      individualBids[j].bid = matchedVirtualNodes[i][index].bid;
                      individualBids[j].cost = matchedVirtualNodes[i][index].cost;
                      individualBids[j].InP = i;
                    }
                    else if (individualBids[j].reservedPrice === individualBids[j].bid
                      || individualBids[j].reservedPrice > matchedVirtualNodes[i][index].bid) {
                      notWinningBids.push({idVirtualNode: matchedVirtualNodes[i][index].idVirtualNode, InP: matchedVirtualNodes[i][index].InP});
                      individualBids[j].reservedPrice = matchedVirtualNodes[i][index].bid;
                    }
                    else {
                      notWinningBids.push({idVirtualNode: matchedVirtualNodes[i][index].idVirtualNode, InP: matchedVirtualNodes[i][index].InP});
                    }
                  }
                  else {
                    matchedVirtualNodes[i][index].reservedPrice = matchedVirtualNodes[i][index].bid;
                    matchedVirtualNodes[i][index].InP = i;
                    individualBids.push(matchedVirtualNodes[i][index]);
                  }
                }
              }
            });
            packagePricingInPs.forEach((InPAndBid,i) => {
              if (i === 0) {
                packageBid.reservedPrice = InPAndBid.bid;
                packageBid.lowestBid = InPAndBid.bid;
                packageBid.InP = InPAndBid.InP;
                packageBid.cost = InPAndBid.cost;
              }
              else {
                if (InPAndBid.bid <= packageBid.reservedPrice) {
                  notWinningPackageBids.push({InP: packageBid.InP});
                  packageBid.reservedPrice = packageBid.lowestBid;
                  packageBid.lowestBid = InPAndBid.bid;
                  packageBid.InP = InPAndBid.InP;
                  packageBid.cost = InPAndBid.cost;
                }
                // If bigger than lowest bid but smaller than reserved price
                else if (packageBid.lowestBid === packageBid.reservedPrice ||
                  InPAndBid.bid < packageBid.reservedPrice) {
                  notWinningPackageBids.push({InP: InPAndBid.InP});
                  packageBid.reservedPrice = InPAndBid.bid;
                }
                else {
                  notWinningPackageBids.push({InP: InPAndBid.InP});
                }
              }
            });
            //console.log("-- individualBids", individualBids);
            callback(null, individualBids, packageBid, notWinningBids, notWinningPackageBids, usersContract)
          },

          function partitioning(individualBids, packageBid, notWinningBids, notWinningPackageBids, usersContract, callback) {
            let incompleteInd = false;
            if (individualBids.length < req.body.idVirtualNodes.length) {
              incompleteInd = true;
            }
            let sum = individualBids.map(x => x.reservedPrice).reduce((a, b) => a + b, 0);
            //console.log("-- sum", sum);
            //console.log("-- packageBid.reservedPrice", packageBid.reservedPrice);
            // package pricing wins
            if (!incompleteInd && ( !packageBid.reservedPrice  ||  packageBid.reservedPrice <= sum)) {
              // If winning InPs in virtual nodes are different, add inter-link costs.
              individualBids.forEach(bid => {
                for (let i = 0; i < req.body.idLinks.length; i++) {
                  if (req.body.idVirtualNodes[req.body.from[i]] === bid.idVirtualNode) {
                    if (bid.InP !== individualBids.filter(y => y.idVirtualNode === req.body.idVirtualNodes[req.body.to[i]]).InP) {
                      bid.reservedPrice += (req.body.dBandwidth[i] * 1) / 2;
                    }
                  }
                  else if (req.body.idVirtualNodes[req.body.to[i]] === bid.idVirtualNode) {
                    if (bid.InP !== individualBids.filter(y => y.idVirtualNode === req.body.idVirtualNodes[req.body.from[i]]).InP) {
                      bid.reservedPrice += (req.body.dBandwidth[i] * 1)  / 2;
                    }
                  }
                }
              });
              return callback(null, null, individualBids,  notWinningBids, notWinningPackageBids, usersContract);
            }
            // individualVirtualNodes
            else if (packageBid.reservedPrice) {
              return callback(null, packageBid, null, notWinningBids, notWinningPackageBids, usersContract);
            }
            else {
              callback('No solution exists', individualBids, usersContract)
            }
          },

          function updateInPsCapacities(packageBid, indBids, notWinningBids, notWinningPackageBids, usersContract, callback) {
            updateCapacitiesInPs(usersContract, packageBid, indBids, notWinningBids, notWinningPackageBids, false, req, (res) => {
              callback(null, packageBid, indBids, notWinningBids, usersContract);
            })

          },
          function lifeTimeEnded (packageBid, indBids, notWinningBids, usersContract, callback) {
            res.json({ok: 200});
            setTimeout(updateCapacitiesInPs, req.body.lifetime, usersContract, packageBid, indBids, null, null, true, req, (res) => {
              callback(null, notWinningBids,usersContract);
            });
          }
        ], (err,notWinningBids, usersContract) => {
          if (err) {
            console.log("-- notWinningBids", notWinningBids);
            storeValues("infinity", req.body.arrivalRate,req.body.isNewTest, req.body.numOfRequest);
            /*if (notWinningBids)
              updateCapacitiesInPs(usersContract, null, null, notWinningBids, null, true, req, (res) => {
            });*/
            return res.send(500, err);
          }
        })
      })
    });

  function updateCapacitiesInPs(usersContract, packageBid, indBids,  notWinningBids, notWinningPackageBids, isFinished, req, callback) {
    console.log(isFinished);
    if (packageBid) {
      if (!isFinished) {
        storeValues(packageBid.reservedPrice, req.body.arrivalRate, req.body.isNewTest, req.body.numOfRequest);
        storeWinner(packageBid.InP, req.body.idVirtualNodes.length, req.body.isNewTest, req.body.arrivalRate, req.body.numOfRequest, req.body.idVirtualNodes.length);
      }
      usersContract.updateCapacities(req.body.computing_demands, req.body.resourceTypes, req.body.locations, !isFinished,
        {from: packageBid.InP, gas: 1400000}).then(res => {
      });
      callback(null);
    }
    else {
      if (!isFinished) {
        storeValues(indBids.map(x => x.reservedPrice).reduce((a, b) => a + b, 0), req.body.arrivalRate, req.body.isNewTest, req.body.numOfRequest);
        storeWinner(null, 1, req.body.isNewTest, req.body.arrivalRate, req.body.numOfRequest, req.body.idVirtualNodes.length, indBids);

      }
      async.eachOf(indBids, function eachBid(bid, index, eachOfCallback) {
          let i = req.body.idVirtualNodes.indexOf(bid.idVirtualNode);
          usersContract.updateCapacity(req.body.computing_demands[i], req.body.resourceTypes[i], req.body.locations[i], !isFinished,
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

  function storeWinner(InP, numOfVirtualNodes, isNewTest, arrivalRate, numOfRequest, total, indBids) {
    /*let newLine = "\r\n";
    let obj = csv();
    obj.from.path('../evaluation/experiments/1/winner/winner1.csv').to.array(data => {
      let lastRow = data.length - 1;
      let data2;
      if (indBids) {
        let InP1 = indBids.map(x =>x.InP).filter(y => y === '0xde501181911262542393beb7298b2f22e7c64416').length;
        let InP2 = indBids.map(x =>x.InP).filter(y => y === '0xd358821084f42c7e60ae0ca89b4337eb0cb24bb0').length;
        let InP3 = indBids.map(x =>x.InP).filter(y => y === '0xa18a26a37141f10f5874a30237dac76dd8994bdb').length;
        if (isNewTest) {
          data2 = newLine + [arrivalRate, InP1, InP2, InP3] + ",";
        }
        else {
          data2 = [InP1/total, InP2/total, InP3/total] + ",";
        }
      }
      else {
        if (InP === '0xde501181911262542393beb7298b2f22e7c64416') {
          if (isNewTest) {
            data2 = newLine + [arrivalRate, 1, 0, 0] + ",";
          }
          else {
            data2 = [1, 0, 0] + ",";

          }
        }
        else if (InP === '0xd358821084f42c7e60ae0ca89b4337eb0cb24bb0' ) {
          if (isNewTest) {
            data2 = newLine + [arrivalRate, 0, 1, 0] + ",";
          }
          else {
            data2 = [0,1, 0] + ",";
          }

        }
        else {
          if (isNewTest) {
            data2 = newLine + [arrivalRate, 0, 0, numOfVirtualNodes] + ",";
          }
          else {
            data2 = [0,0,1] + ",";
          }

        }
      }
      fs.appendFile('../evaluation/experiments/1/winner/winner1.csv', data2, err => {
          if (err) throw err;
          console.log('The data3 was appended to file!');
      });

    })*/
  }

  function storeValues(price, arrivalRate, isNewTest, numOfRequest) {
    /** Start price **/
    /*let newLine = "\r\n";
    let data;
    if (isNewTest) {
      data = newLine + price + ",";
    }
    else {
      data = price + ",";
    }
    if (price !== "infinity") {
      let fileName = "price3_1.csv";
      fs.appendFile('../evaluation/experiments/1/pricing/' + fileName, data, err => {
        if (err) throw err;
        console.log('The data1 was appended to file!');
      });
    }

    /** Start average rate **/
    /*
    let data2;
    let isNewLine = null;
    if (numOfRequest === 1) {
      isNewLine = newLine;
    }
    if (price === "infinity") {
      data2 = isNewLine + 0 + ",";
    }
    else {
      data2 = isNewLine + 1 + ",";
    }
    let obj = csv();
    console.log("-- numOfRequest", numOfRequest);
    if (numOfRequest === 100) {
      obj.from.path('../evaluation/experiments/1/acceptanceRate/acceptanceRate.csv').to.array(data => {
        let lastRow = data.length - 1;
        let percentages = [];
        let newSum = 0;
        for (let i = 0; i < data[lastRow].length; i++) {
          if (i === data[lastRow].length - 1) {
            if (price === "infinity") {
              newSum += parseInt(0);
            }
            else {
              newSum += parseInt(1);
            }
          }
          else {
            newSum += parseInt(data[lastRow][i]);
          }
          percentages.push(newSum / (i + 1));
        }
        fs.appendFile('../evaluation/experiments/1/acceptanceRate/acceptanceRate.csv', data2 + newLine + percentages, function (err) {
          if (err) throw err;
          console.log('The data2 was appended to file!');
        });
      })
    }
    else {
      fs.appendFile('../evaluation/experiments/1/acceptanceRate/acceptanceRate.csv', data2, function (err) {
        if (err) throw err;
        console.log('The data2 was appended to file!');
      });
    }*/
  }

  /*Users.deployed().then(usersContract => {
  async.waterfall([
    async.constant(usersContract),
    // Get the virtual nodes matched of the InPs and creates bids
    function getMatchedVirtualNodesAndCreateBid(usersContract,callback) {
      let matchedVirtualNodes = [];
      let packagePricingInPs =[];
      async.eachOfSeries(req.body.InPs, function eachInP(InP, i, eachOfSeriesCallback) {
          usersContract.getCostsAndCapacities.call(req.body.locations, req.body.resourceTypes, {from: InP, gas: 1400000})
            .then(data => {
              let counter = 0;
              data[0].forEach((uCosts, i) =>{
                if (uCosts.toNumber() !== 0 && data[1][i].toNumber() + req.body.computing_demands[i] <= data[2][i].toNumber()) {
                  // (uCapacity + computing_demand) / allCapacity
                  let u = (data[1][i].toNumber() + req.body.computing_demands[i]) / data[2][i].toNumber();
                  let cost = (uCosts.toNumber() + (u / (1 - u))); //TODO  * req.body.lifetime
                  let individualMargin = 0; //TODO MARGINS
                  let bid = cost * (1 + individualMargin);
                  // TODO UPDATE CAPACITIES
                  if (bid <= req.body.upperBoundCosts[i]) {
                    if (matchedVirtualNodes[InP]) {
                      matchedVirtualNodes[InP].push({
                        idVirtualNode: req.body.idVirtualNodes[i],
                        resourceType: req.body.resourceTypes[i],
                        location: web3.toUtf8(data[3][i]),
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
                        location: web3.toUtf8(data[3][i]),
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
          callback(err, matchedVirtualNodes, packagePricingInPs, usersContract);
        });
    },

    // Creates the vickrey contract and adds the allowed InPs
    function createContract(matchedVirtualNodes, packagePricingInPs, usersContract, callback) {
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
          vickreyContract.commitPackageBid(packagePricingInPs.filter(x => x.InP === InP)[0].bid, {from: InP, gas: 1400000}).then(res => {
            return eachOfCallback();
          })
        }
      },
        function(err) {
          callback(err, vickreyContract, usersContract)
        });
    },
    // Partitioning
    function getBidsPerVirtualNode (vickreyContract, usersContract, callback) {
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
          callback(err, individualBids, individualNotCompleted, indInPs, vickreyContract, usersContract);
        });
    },
    function getPackageBids(individualBids, individualNotCompleted, indInPs, vickreyContract, usersContract, callback) {
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
        callback(null, individualBids, individualNotCompleted, indInPs, packageBid, packageInPs, packageNotExist, vickreyContract, usersContract);
      });
    },
    function compareIndividualAndPackageBids(individualBids, individualNotCompleted, indInPs, packageBid, packageInPs, packageNotExist, vickreyContract, usersContract, callback) {
      console.log("-- individualBids", individualBids);
      console.log("-- packageBid", packageBid);
      let sum = individualBids.map(x => x.reservedPrice).reduce((a, b) => a + b, 0);
      // package pricing wins
      if ((individualNotCompleted ||  packageBid.reservedPrice <= sum) && !packageNotExist) {
        console.log("-- sum", sum);
        vickreyContract.addPackageWinnersAndBids(packageBid.reservedPrice, packageBid.InP, {from: req.user, gas: 1400000});
        let isSent = false;
        vickreyContract.LogEnded().watch((error, result) => {
          if (!isSent) {
            isSent = true;
            return callback(null, packageBid, null, vickreyContract, usersContract);
          }
        })
      }
      // individualVirtualNodes
      else if (!individualNotCompleted) {
        let idVirtualNodes = [];
        let reservedPrices = [];
        let InPs = [];
        // If winning InPs in virtual nodes are different, add inter-link costs.
        individualBids.forEach(bid => {
          for (let i = 0; i < req.body.idLinks.length; i++) {
            if (req.body.idVirtualNodes[req.body.from[i]] === bid.idVirtualNode) {
              if (bid.InP !== individualBids.filter(y => y.idVirtualNode === req.body.idVirtualNodes[req.body.to[i]]).InP) {
                bid.reservedPrice += (req.body.dBandwidth[i] * 1) / 2;
              }
            }
            else if (req.body.idVirtualNodes[req.body.to[i]] === bid.idVirtualNode) {
              if (bid.InP !== individualBids.filter(y => y.idVirtualNode === req.body.idVirtualNodes[req.body.from[i]]).InP) {
                bid.reservedPrice += (req.body.dBandwidth[i] * 1)  / 2;
              }
            }
          }
          idVirtualNodes.push(bid.idVirtualNode);
          reservedPrices.push(bid.reservedPrice);
          InPs.push(bid.InP);
        });
        vickreyContract.addIndividualWinnersAndBids(idVirtualNodes, reservedPrices, InPs, {from: req.user, gas: 1400000});
        let isSent = false;
        vickreyContract.LogEnded().watch((error, result) => {
          if (!isSent) {
            isSent = true;
            return callback(null, null, individualBids, vickreyContract, usersContract);
          }
        })
      }
      else {
        callback('No solution exists')
      }
    },
    function updateInPsCapacities(packageBid, indBids, vickreyContract, usersContract, callback) {
      updateCapacitiesInPs(usersContract, packageBid, indBids, true, req, (res) => {
        callback(null, packageBid, indBids, vickreyContract, usersContract);
      })

    },
    function lifeTimeEnded (packageBid, indBids, vickreyContract, usersContract, callback) {
      setTimeout(updateCapacitiesInPs, req.body.lifetime, usersContract, packageBid, indBids, false, req, () => {
        callback(null, packageBid, indBids,vickreyContract);
      });
    }
  ], (err) => {
    if (err) return res.send(500, err);
  })
})
});*/
}
