pragma solidity ^0.4.0;

contract VickreyAuction {

  address public owner; //SP address
  address[] public bidders; //InP addresses
  address[] public packageBidders; //InP addresses

  address public packageWinner;
  uint8 public reservedPackagePrice;

  // Set to true at the end, bid has been payed.
  bool public ended;
  uint256 public endTime;

  // bid per virtual node
  struct Bid {
    address InP;
    uint8 value;
  }

  struct VirtualNode {
    bytes32 id;
    bytes32 resourceType;
    bytes32 location;
    int x;
    int y;
    uint8 upperBoundCost;
  }

  struct VirtualLink {
    bytes32 id;
    bytes32 from;
    bytes32 to;
    uint8 dBandwidth;
  }

  mapping(bytes32 => address[]) public allowedInPsPerVirtualNode;
  mapping(address => bool) public isInPPackageAllowed;
  mapping(bytes32 => Bid[]) private bids; //per virtual node
  mapping(bytes32 => Bid) private winningBid; //per virtual node
  mapping(address => uint8) private packageBid;
  mapping(address => bool) private hasBidded;

  VirtualNode[] public virtualNodes;
  mapping(bytes32 => VirtualLink[]) public links; //from idVirtualNode

  modifier isOwner(address sender) { require(sender == owner); _; }
  modifier onlyBefore(uint _time) { require(now < _time); _; }
  modifier onlyAfter(uint _time) { require(now > _time); _; }

  event LogBidderPushed(address InP, bool va);
  event LogPackageBid(bool isFinished, uint8 value);
  event LogIndividualBids(bool isFinished, uint8[] values);
  event LogError(bytes32 message);
  event LogEnded(bool hasEnded);

  // Method called when contract is created
  function VickreyAuction(bytes32[] idVirtualNodes, bytes32[] resourceTypes, bytes32[] locations, uint8[] upperBoundCosts, int[] x, int[] y,
    bytes32[] idLinks, bytes32[] from, bytes32[] to, uint8[] dBandwidth, uint256 time) public {
    owner = msg.sender;
    ended = false;
    addVirtualNodes(idVirtualNodes, resourceTypes, locations, x, y, upperBoundCosts);
    addVirtualLinks(idLinks, from, to, dBandwidth);
    endTime = time;
  }

  // Add virtual nodes
  function addVirtualNodes(bytes32[] idVirtualNodes, bytes32[] resourceTypes, bytes32[] locations, int[] x, int[] y, uint8[] upperBoundCosts) public {
    for(uint i = 0; i < idVirtualNodes.length; i++) {
      virtualNodes.push(VirtualNode({id: idVirtualNodes[i], resourceType: resourceTypes[i], location: locations[i], x: x[i], y: y[i], upperBoundCost: upperBoundCosts[i]}));
    }
  }

  // Add virtual links
  function addVirtualLinks(bytes32[] idLinks, bytes32[] from, bytes32[] to, uint8[] dBandwidth) public {
    for(uint i = 0; i < idLinks.length; i++) {
      links[from[i]].push(VirtualLink({id: idLinks[i], from: from[i], to: to[i], dBandwidth: dBandwidth[i]}));
    }
  }

  // InPs can be repeated in the list
  function addAllowedInPs(address[] allowedInPs, bytes32[] allowedVirtualNodes, address[] packageAllowedInPs) public isOwner(msg.sender) {
    addAllowedInPsPerVirtualNode(allowedInPs, allowedVirtualNodes);
    addInPPackageAllowed(packageAllowedInPs);
  }

  // Add InPs allowed to bid per virtual node
  function addAllowedInPsPerVirtualNode(address[] allowedInPs, bytes32[] allowedVirtualNodes) private {
    for(uint i = 0; i < allowedVirtualNodes.length; i++) {
      allowedInPsPerVirtualNode[allowedVirtualNodes[i]].push(allowedInPs[i]);
    }
  }

  // Add InPs allowed to bid for the whole virtual network
  function addInPPackageAllowed(address[] packageAllowedInPs) private {
    for(uint i = 0; i < packageAllowedInPs.length; i++) {
      isInPPackageAllowed[packageAllowedInPs[i]] = true;
    }
  }

  // Gets virtual nodes
  function getVirtualNodes() public constant returns (bytes32[], bytes32[], int[], int[], bytes32[], uint8[]) {
    bytes32[] memory idVirtualNodes = new bytes32[](virtualNodes.length);
    bytes32[] memory locations = new bytes32[](virtualNodes.length);
    int[] memory x = new int[](virtualNodes.length);
    int[] memory y = new int[](virtualNodes.length);
    bytes32[] memory resourceTypes = new bytes32[](virtualNodes.length);
    uint8[] memory upperBoundCosts = new uint8[](virtualNodes.length);

    for (uint i = 0; i < virtualNodes.length; i++) {
      idVirtualNodes[i] = virtualNodes[i].id;
      locations[i] = virtualNodes[i].location;
      x[i] = virtualNodes[i].x;
      y[i] = virtualNodes[i].y;
      resourceTypes[i] = virtualNodes[i].resourceType;
      upperBoundCosts[i] = virtualNodes[i].upperBoundCost;
    }
    return (idVirtualNodes, locations, x, y, resourceTypes, upperBoundCosts);
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

  function getAllowedInPsPerVirtualNode(bytes32 idVirtualNode) public constant returns (address[]) {
    return allowedInPsPerVirtualNode[idVirtualNode];
  }

  function isPackageAllowed() public constant returns (bool) {
    return isInPPackageAllowed[msg.sender];
  }

  // InP commit individual bids
  function commitIndividualBids(bytes32[] idVirtualNodes, uint8[] values) public onlyBefore(endTime) {
    if (!hasBidded[msg.sender]) {
      bool isRegistered = isBidderRegistered(msg.sender, false);
      for(uint i = 0; i < idVirtualNodes.length; i++) {
        if (isInPPackageAllowed[msg.sender] || isBidderAllowed(msg.sender, idVirtualNodes[i])) {
          if (!isRegistered) {
            bidders.push(msg.sender);
          }
          bids[idVirtualNodes[i]].push(Bid({InP: msg.sender, value: values[i]}));
          hasBidded[msg.sender] = true;
        }
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
  function commitPackageBid(uint8 value) public onlyBefore(endTime) {
    if (!hasBidded[msg.sender] && isInPPackageAllowed[msg.sender]) {
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

  function isBidderAllowed(address bidder, bytes32 idVirtualNode) public constant returns (bool){
    for(uint i = 0; i < allowedInPsPerVirtualNode[idVirtualNode].length; i++) {
      if (allowedInPsPerVirtualNode[idVirtualNode][i] == bidder) {
        // Check if bidder has already voted
        for (uint k = 0; k < bids[idVirtualNode].length; k ++) {
          if (bids[idVirtualNode][k].InP == bidder) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }


  function getBidsPerVirtualNode(bytes32 idVirtualNode) public constant returns (address[], uint8[]){
    address[] memory InPs = new address[](bids[idVirtualNode].length);
    uint8[] memory values = new uint8[](bids[idVirtualNode].length);
    for (uint i = 0; i < bids[idVirtualNode].length; i++) {
      InPs[i] = bids[idVirtualNode][i].InP;
      values[i] = bids[idVirtualNode][i].value;
    }
    return (InPs, values);
  }

  function getPackageBids() public constant returns (address[], uint8[]) {
    uint8[] memory values = new uint8[](packageBidders.length);
    for (uint i = 0; i < packageBidders.length; i++) {
      values[i] = packageBid[packageBidders[i]];
    }
    return (packageBidders, values);
  }

  function addIndividualWinnersAndBids(bytes32[] idVirtualNodes, uint8[] values, address[] InPs) public isOwner(msg.sender) onlyAfter(endTime) {
    for (uint i = 0; i < idVirtualNodes.length; i++) {
      winningBid[idVirtualNodes[i]].value = values[i];
      winningBid[idVirtualNodes[i]].InP = InPs[i];
    }
    ended = true;
    LogEnded(true);
  }

  function addPackageWinnersAndBids(uint8 value, address InP) public isOwner(msg.sender) onlyAfter(endTime) {
    packageWinner = InP;
    reservedPackagePrice = value;
    ended = true;
    LogEnded(true);
  }

  function getIndividualWinnersAndBids() public constant returns (address[], bytes32[], uint8[]) {
    uint8[] memory values = new uint8[](virtualNodes.length);
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
