pragma solidity ^0.4.0;

contract VickreyAuction_evaluation {

  address public owner; //SP address
  address[] public bidders; //InP addresses
  address[] public packageBidders; //InP addresses

  address public packageWinner;
  uint256 public reservedPackagePrice;

  // Set to true at the end, bid has been payed.
  bool public ended;

  // bid per virtual node
  struct Bid {
    address InP;
    uint256 value;
  }

  struct VirtualNode {
    bytes32 id;
    bytes32 resourceType;
    bytes32 location;
    uint8 capacity;
    uint256 upperBoundCost;
  }

  struct VirtualLink {
    bytes32 id;
    bytes32 from;
    bytes32 to;
    uint8 dBandwidth;
  }

  mapping(bytes32 => Bid[]) private bids; //per virtual node
  mapping(bytes32 => Bid) private winningBid; //per virtual node
  mapping(address => uint256) private packageBid;
  mapping(address => bool) private hasBidded;

  VirtualNode[] public virtualNodes;
  mapping(bytes32 => VirtualLink[]) public links; //from idVirtualNode

  event LogBidderPushed(address InP, bool va);
  event LogPackageBid(bool isFinished, uint256 value);
  event LogIndividualBids(bool isFinished, uint256[] values);
  event LogError(bytes32 message);
  event LogEnded(bool hasEnded);

  // Method called when contract is created
  function VickreyAuction(bytes32[] idVirtualNodes, bytes32[] resourceTypes, bytes32[] locations, uint256[] upperBoundCosts, uint8[] capacities,
    bytes32[] idLinks, bytes32[] from, bytes32[] to, uint8[] dBandwidth) public {
    owner = msg.sender;
    ended = false;
    addVirtualNodes(idVirtualNodes, resourceTypes, locations, upperBoundCosts, capacities);
    addVirtualLinks(idLinks, from, to, dBandwidth);
  }

  // Add virtual nodes
  function addVirtualNodes(bytes32[] idVirtualNodes, bytes32[] resourceTypes, bytes32[] locations, uint256[] upperBoundCosts, uint8[] capacities) public {
    for(uint i = 0; i < idVirtualNodes.length; i++) {
      virtualNodes.push(VirtualNode({id: idVirtualNodes[i], resourceType: resourceTypes[i], location: locations[i], upperBoundCost: upperBoundCosts[i], capacity: capacities[i]}));
    }
  }

  // Add virtual links
  function addVirtualLinks(bytes32[] idLinks, bytes32[] from, bytes32[] to, uint8[] dBandwidth) public {
    for(uint i = 0; i < idLinks.length; i++) {
      links[from[i]].push(VirtualLink({id: idLinks[i], from: from[i], to: to[i], dBandwidth: dBandwidth[i]}));
    }
  }

  // Get virtual links from a virtual node
  function getVirtualLinks(bytes32 idVirtualNode) public constant returns (bytes32[], bytes32[], bytes32[], uint8[]) {
    var virtualNodeLinks = links[idVirtualNode];
    bytes32[] memory idLinks = new bytes32[](virtualNodeLinks.length);
    bytes32[] memory from = new bytes32[](virtualNodeLinks.length);
    bytes32[] memory to = new bytes32[](virtualNodeLinks.length);
    uint8[] memory dBandwidth = new uint8[](virtualNodeLinks.length);
    for (uint i = 0; i < virtualNodeLinks.length; i++) {
      idLinks[i] = virtualNodeLinks[i].id;
      from[i] = virtualNodeLinks[i].from;
      to[i] = virtualNodeLinks[i].to;
      dBandwidth[i] = virtualNodeLinks[i].dBandwidth;
    }
    return (idLinks, from, to, dBandwidth);
  }


  // InP commit individual bids
  function commitIndividualBids(bytes32[] idVirtualNodes, uint256[] values) {
    if (!hasBidded[msg.sender]) {
      bool isRegistered = isBidderRegistered(msg.sender, false);
      for(uint i = 0; i < idVirtualNodes.length; i++) {
        if (!isRegistered) {
          bidders.push(msg.sender);
        }
        bids[idVirtualNodes[i]].push(Bid({InP: msg.sender, value: values[i]}));
        hasBidded[msg.sender] = true;
      }
      if (hasBidded[msg.sender]) {
        LogIndividualBids(true, values);
      }
      else {
        LogError('User is not allowed');
      }
    }
    else {
      LogError('User has already bidded');
    }
  }

  // InP commit package Bid
  function commitPackageBid(uint256 value) {
    if (!hasBidded[msg.sender]) {
      if (!isBidderRegistered(msg.sender, true)) {
        packageBidders.push(msg.sender);
      }
      packageBid[msg.sender] = value;
      hasBidded[msg.sender] = true;
      LogPackageBid(true, value);
    }
    else {
      LogError('User has already bidded');
    }
  }


  function isBidderRegistered(address bidder, bool isPacketBidder) public constant returns (bool){
    if (isPacketBidder) {
      for(uint i = 0; i < bidders.length; i++) {
        if (bidder == bidders[i]) {
          return true;
        }
      }
      return false;
    }

    else {
      for(uint j = 0; j < packageBidders.length; j++) {
        if (bidder == packageBidders[j]) {
          return true;
        }
      }
      return false;
    }
  }

  function getBidsPerVirtualNode(bytes32 idVirtualNode) public constant returns (address[], uint256[]){
    address[] memory InPs = new address[](bids[idVirtualNode].length);
    uint256[] memory values = new uint256[](bids[idVirtualNode].length);
    for (uint i = 0; i < bids[idVirtualNode].length; i++) {
      InPs[i] = bids[idVirtualNode][i].InP;
      values[i] = bids[idVirtualNode][i].value;
    }
    return (InPs, values);
  }

  function getPackageBids() public constant returns (address[], uint256[]) {
    uint256[] memory values = new uint256[](packageBidders.length);
    for (uint i = 0; i < packageBidders.length; i++) {
      values[i] = packageBid[packageBidders[i]];
    }
    return (packageBidders, values);
  }

  function addIndividualWinnersAndBids(bytes32[] idVirtualNodes, uint256[] values, address[] InPs) {
    for (uint i = 0; i < idVirtualNodes.length; i++) {
      winningBid[idVirtualNodes[i]].value = values[i];
      winningBid[idVirtualNodes[i]].InP = InPs[i];
    }
    ended = true;
    LogEnded(true);
  }

  function addPackageWinnersAndBids(uint256 value, address InP) public {
    packageWinner = InP;
    reservedPackagePrice = value;
    ended = true;
    LogEnded(true);
  }

  function getIndividualWinnersAndBids() public constant returns (address[], bytes32[], uint256[]) {
    uint256[] memory values = new uint256[](virtualNodes.length);
    address[] memory InPs = new address[](virtualNodes.length);
    bytes32[] memory idVirtualNodes = new bytes32[](virtualNodes.length);
    for (uint i = 0; i < virtualNodes.length; i++) {
      idVirtualNodes[i] = virtualNodes[i].id;
      values[i] = winningBid[virtualNodes[i].id].value;
      InPs[i] = winningBid[virtualNodes[i].id].InP;
    }
    return (InPs, idVirtualNodes, values);
  }
}

