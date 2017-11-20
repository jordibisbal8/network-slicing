pragma solidity ^0.4.0;

import "./User.sol";


contract ProductFactory {
  bytes32[] public namesList;
  address[] public contractsList;
  uint nbContracts;

  mapping (bytes32 => string) public nameToString;

  event CreatedContract(address _from, bytes32 name, Contract addr);

  function Factory() {
    nbContracts = 0;
  }

  function createContract (bytes32 name) public {
    Contract newContract = new Contract(name);
    CreatedContract(msg.sender,name,newContract);
    namesList.push(name);
    nbContracts ++;
    contractsList.push(newContract);
  }

  function getContractCount() public constant returns(uint contractCount)
  {
    return contractsList.length;
  }
  function getContractByName(bytes32 name) public constant returns (address x) {
    uint index = indexOfContract(name);
    if (index == uint(-1)) revert();
    return contractsList[index];
  }

  function indexOfContract(bytes32 name) private returns (uint) {
    for(uint i = 0; i < namesList.length; i++) {
      if (namesList[i] == name) {
        return i;
      }
    }
    return uint(-1);
  }
  function allContracts() constant returns (address[]) {
    return contractsList;
  }
  function getAllUsers(address userContractAddress) constant returns (uint count) {
    User usr = User(userContractAddress);
    return usr.getUserCount();

  }
  // TODO FUNCTION THAT GETS ALL THE CONTRACTS WHERE YOU ARE THE MEMBER OR THE OWNER
}

contract Contract {
  bytes32 public Name;
  //TODO _id
  //TODO Owner
  //TODO modifier isOwner
  // TODO modifier isMember

  function Contract (bytes32 name) {
    Name = name;
  }
}
