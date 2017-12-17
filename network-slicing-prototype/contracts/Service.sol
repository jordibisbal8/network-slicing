pragma solidity ^0.4.0;

contract Service {

  bytes32 public name;
  uint public maxPrice;
  address public owner;
  address[] public members;

  uint public biddingEnd;
  uint public revealEnd;
  bool public ended;

  struct VirtualNode {
    bytes32 id;
    bytes32 resource;
    bytes32 x;
    bytes32 y;
    bytes32 location;
  }
  struct Voter {
    uint cost;
    bool voted;  // if true, that person already voted
    uint idProposal;   // index of the voted proposal
  }

  /*struct VirtualLink {
    bytes32 id;
    VirtualNode.id from;
    VirtualNode.id to;
    uint bw;
  }*/
  // This is a type for a single proposal.
  struct Proposal {
    bytes32 idVirtualNode;
    uint cost; // cost for the virtual node
  }


  modifier isOwner() {
    require(msg.sender == owner);
    _;
  }

  //modifier isMember() {
   /* for(uint i = 0; i < members.length; i++) {
      if (members[i] == msg.sender) {
        return true
      }
    }
    return false;
  }*/

  function Service (bytes32 Name, uint price) {
    name = Name;
    owner = msg.sender;
  }
}
