pragma solidity ^0.4.0;

contract User {

  struct UserStruct {
    //bytes32 name;
    bytes32 email;
    bytes32 role;
    // TODO community/group
    uint index;
  }

  mapping(address => UserStruct) private userStructs;
  address[] public userAddresses;

  /* A dynamically-sized array of Roles.
  bytes32[] public roles;*/

  // Events just called in transactions, not in calls!
  event LogNewUser (address indexed userAddress, uint index, bytes32 email, bytes32 role);
  event LogUpdateUser(address indexed userAddress, uint index, bytes32 email, bytes32 role);
  event LogDeleteUser(address indexed userAddress, uint index);
  event LogErrors(string error);

  function isUserRegistered(address userAddress) public constant returns(bool isIndeed)
  {
    if(userAddresses.length == 0) return false;
    return (userAddresses[userStructs[userAddress].index] == userAddress);
  }

  function insertUser(address userAddress, bytes32 email, bytes32 role)
  {
    //require(thing, "Thing is invalid");
  if(isUserRegistered(userAddress)){
      LogErrors("User is already registered");
      return;
    }
    userStructs[userAddress].email = email;
    userStructs[userAddress].role = role;
    userStructs[userAddress].index = userAddresses.push(userAddress)-1; //since .push() returns the new array length
    LogNewUser(userAddress, userStructs[userAddress].index, email, role);
  }
  // Function that deletes an user, we overwrite deleted User from userAddresses with the lastUser in the List.
  // Then, we change the user index in the userStruct
  function deleteUser(address userAddress) public returns(uint index)
  {
    if(!isUserRegistered(userAddress)) revert(); //user don't exist
    uint i = userStructs[userAddress].index;
    address lastUser = userAddresses[userAddresses.length-1];
    userAddresses[i] = lastUser;
    userStructs[lastUser].index = i;
    userAddresses.length--;
    LogDeleteUser(userAddress, i);
    return i;
  }


  function getUser(address userAddress) public constant returns(bytes32 email, bytes32 role, uint index)
  {
    if(!isUserRegistered(userAddress)) revert();
    return(
    userStructs[userAddress].email,
    userStructs[userAddress].role,
    userStructs[userAddress].index);
  }

  function updateUserEmail(address userAddress, bytes32 email) public returns(bool success)
  {
    if(!isUserRegistered(userAddress)) revert();
    userStructs[userAddress].email = email;
    LogUpdateUser(userAddress, userStructs[userAddress].index, email, userStructs[userAddress].role);
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
      roles[i] = userStructs[userAddresses[i]].role;
    }
    return (userAddresses, roles);
  }

}
