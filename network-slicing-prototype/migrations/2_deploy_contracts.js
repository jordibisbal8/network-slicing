let Users = artifacts.require("./Users.sol");
let VickreyAuction = artifacts.require("./VickreyAuction.sol");
let Users_evaluation = artifacts.require("./Users_evaluation.sol");
let VickreyAuction_evaluation = artifacts.require("./VickreyAuction_evaluation.sol");


module.exports = function(deployer) {
  deployer.deploy(Users);
  deployer.deploy(VickreyAuction);
  deployer.deploy(Users_evaluation);
  deployer.deploy(VickreyAuction_evaluation);
};
