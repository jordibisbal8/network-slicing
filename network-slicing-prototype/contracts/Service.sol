pragma solidity ^0.4.0;

contract Service {

  bytes32 public name;

  function Service (bytes32 Name, uint price) {
    name = Name;
    owner = msg.sender;
  }
}
