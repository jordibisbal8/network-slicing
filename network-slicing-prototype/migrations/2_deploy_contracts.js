//var ConvertLib = artifacts.require("./ConvertLib.sol");
//var MetaCoin = artifacts.require("./MetaCoin.sol");
//var ServiceFactory = artifacts.require("./ServiceFactory.sol");
//var Service = artifacts.require("./Service.sol");
var User = artifacts.require("./User.sol");
var DAuctions = artifacts.require("./DAuctions.sol");


module.exports = function(deployer) {
  //deployer.deploy(ConvertLib);
  //deployer.link(ConvertLib, MetaCoin);
  //deployer.deploy(MetaCoin);
  deployer.deploy(DAuctions);
  //deployer.deploy(Service);
  //deployer.deploy(ServiceFactory);
  deployer.deploy(User);
};
