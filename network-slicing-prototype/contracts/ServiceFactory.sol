pragma solidity ^0.4.0;

import "./User.sol";
import "./Service.sol";

// TODO look on Solidity Safe remote purchase example

contract ServiceFactory {
  bytes32[] public servicesNamesList;
  address[] public servicesList;
  uint nbServices;

  mapping (bytes32 => string) public nameToString;

  event CreatedContract(address _from, bytes32 name, uint price, Service addr);

  function ServiceFactory() {
    nbServices = 0;
  }

  function createService (bytes32 name, uint price) public {
    Service newService = new Service(name, price);
    CreatedContract(msg.sender,name, price, newService);
    servicesNamesList.push(name);
    nbServices ++;
    servicesList.push(newService);
  }

  function getServicesCount() public constant returns(uint servicesCount)
  {
    return servicesList.length;
  }
  function getServiceByName(bytes32 name) public constant returns (address x) {
    uint index = indexOfService(name);
    if (index == uint(-1)) revert();
    return servicesList[index];
  }

  function indexOfService(bytes32 name) private returns (uint) {
    for(uint i = 0; i < servicesNamesList.length; i++) {
      if (servicesNamesList[i] == name) {
        return i;
      }
    }
    return uint(-1);
  }
  function allServices() constant returns (address[]) {
    return servicesList;
  }
  /*function getUserCount(address userContractAddress) constant returns (uint count) {
    User usr = User(userContractAddress);
    return usr.getUserCount();
  }*/

  // Get all the services where user is member
  function getServicesUser(address userAddress) constant returns (address[] services) {
    for(uint i = 0; i < servicesList.length; i++) {
      Service service = Service(servicesList[i]);
      //service.members
    }
  }
}
