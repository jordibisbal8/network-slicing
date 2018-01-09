pragma solidity ^0.4.0;

contract User {

  struct UserStruct {
    bytes32 email;
    bytes32 role;
    uint index;
    //bytes32 community;
    //bytes32 name;
    //bytes32 contacts;
  }

  mapping(address => UserStruct) private users;
  address[] public userAddresses;

  // Events just called in transactions, not in calls!
  event LogNewUser (address userAddress, uint index, bytes32 email, bytes32 role);
  event LogUpdateUser(address userAddress, uint index, bytes32 email, bytes32 role);
  event LogDeleteUser(address userAddress, uint index);
  event LogErrors(string error);

  function isUserRegistered(address userAddress) public constant returns(bool isIndeed)
  {
    if (userAddresses.length == 0) return false;
    return (userAddresses[users[userAddress].index] == userAddress);
  }

  function insertUser(address userAddress, bytes32 email, bytes32 role)
  {
    //require(thing, "Thing is invalid");
  if (isUserRegistered(userAddress)) {
      LogErrors("User is already registered");
      return;
    }
    users[userAddress].email = email;
    users[userAddress].role = role;
    users[userAddress].index = userAddresses.push(userAddress)-1; //since .push() returns the new array length
    LogNewUser(userAddress, users[userAddress].index, email, role);
  }
  // Function that deletes an user, we overwrite deleted User from userAddresses with the lastUser in the List.
  // Then, we change the user index in the userStruct
  function deleteUser(address userAddress) public returns(uint index)
  {
    if(!isUserRegistered(userAddress)) revert(); //user don't exist
    uint i = users[userAddress].index;
    address lastUser = userAddresses[userAddresses.length-1];
    userAddresses[i] = lastUser;
    users[lastUser].index = i;
    userAddresses.length--;
    LogDeleteUser(userAddress, i);
    return i;
  }


  function getUser(address userAddress) public constant returns(bytes32 email, bytes32 role, uint index)
  {
    if(!isUserRegistered(userAddress)) revert();
    return(
    users[userAddress].email,
    users[userAddress].role,
    users[userAddress].index);
  }

  function updateUserEmail(address userAddress, bytes32 email) public returns(bool success)
  {
    if(!isUserRegistered(userAddress)) revert();
    users[userAddress].email = email;
    LogUpdateUser(userAddress, users[userAddress].index, email, users[userAddress].role);
    return true;
  }


  function getUserCount() public constant returns(uint count)
  {
    return userAddresses.length;
  }

  function getAllUsers() public constant returns(address[] addrs)
  {
    return userAddresses;
  }

  function getAllUsersAndRoles() public constant returns (address[] addrs, bytes32[] rolesList) {
    bytes32[] memory roles = new bytes32[](userAddresses.length);
    for(uint i = 0; i < userAddresses.length; i++) {
      roles[i] = users[userAddresses[i]].role;
    }
    return (userAddresses, roles);
  }

}
