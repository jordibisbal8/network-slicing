pragma solidity ^0.4.0;

contract User {

  struct UserStruct {
  bytes32 userEmail;
  bytes32 privilege;
  // TODO community/group
  uint index;
  }

  mapping(address => UserStruct) private userStructs;
  address[] private userAddresses;

  event LogNewUser   (address indexed userAddress, uint index, bytes32 userEmail, bytes32 privilege);
  event LogUpdateUser(address indexed userAddress, uint index, bytes32 userEmail, bytes32 privilege);
  event LogDeleteUser(address indexed userAddress, uint index);

  function isUser(address userAddress) public constant returns(bool isIndeed)
  {
    if(userAddresses.length == 0) return false;
    return (userAddresses[userStructs[userAddress].index] == userAddress);
  }

  function insertUser(address userAddress, bytes32 userEmail, bytes32 privilege) public returns(uint index)
  {
    if(isUser(userAddress)) revert(); //it already exists
    userStructs[userAddress].userEmail = userEmail;
    userStructs[userAddress].privilege = privilege;
    userStructs[userAddress].index = userAddresses.push(userAddress)-1; //since .push() returns the new array length
    LogNewUser(userAddress, userStructs[userAddress].index, userEmail, privilege);
    return userAddresses.length-1;
  }
  function deleteUser(address userAddress) public returns(uint index)
  {
    if(!isUser(userAddress)) revert();
    uint i = userStructs[userAddress].index;
    address lastUser = userAddresses[userAddresses.length-1];
    userAddresses[i] = lastUser;
    userStructs[lastUser].index = i;
    userAddresses.length--;
    LogDeleteUser(userAddress, i);
    //LogUpdateUser(lastUser, i, userStructs[lastUser].userEmail, userStructs[lastUser].privilege);
    return i;
  }

  function getUser(address userAddress) public constant returns(bytes32 userEmail, bytes32 privilege, uint index)
  {
    if(!isUser(userAddress)) revert();
    return(
    userStructs[userAddress].userEmail,
    userStructs[userAddress].privilege,
    userStructs[userAddress].index);
  }

  function updateUserEmail(address userAddress, bytes32 userEmail) public returns(bool success)
  {
    if(!isUser(userAddress)) revert();
    userStructs[userAddress].userEmail = userEmail;
    LogUpdateUser(userAddress, userStructs[userAddress].index, userEmail, userStructs[userAddress].privilege);
    return true;
  }

  function updateUserPrivilege(address userAddress, bytes32 privilege) public returns(bool success)
  {
    if(!isUser(userAddress)) revert();
    userStructs[userAddress].privilege = privilege;
    LogUpdateUser(userAddress, userStructs[userAddress].index, userStructs[userAddress].userEmail, privilege);
    return true;
  }

  function getUserCount() public constant returns(uint count)
  {
    return userAddresses.length;
  }

  function getUserAtIndex(uint index) public constant returns(address userAddress)
  {
    return userAddresses[index];
  }
  //TODO GETPROVIDERS from a community.

}
