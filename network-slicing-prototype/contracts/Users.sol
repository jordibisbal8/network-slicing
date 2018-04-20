pragma solidity ^0.4.0;


contract Users {

  struct User {
    uint256 idUser;
    bytes32 name;
    bytes32 email;
    bytes32 role;
  }

  struct PeeringNode {
    bytes32 idPeeringNode;
    bytes32 location;
    bytes32[] resourceTypes;
    int x;
    int y;
    //uint[] usedCapacities;
    //uint capacity;

  }

  struct Link {
    bytes32 idLink;
    bytes32 from;
    bytes32 to;
    uint8 capacity;
    //uint8 usedCapacity
  }

  struct UserAuction {
    address auctionAddr;
    bool isOpened;
    uint256 endTime;
  }

  mapping(address => User) private users;
  mapping(address => PeeringNode[]) private peeringNodes;
  mapping(bytes32 => Link[]) private links;
  mapping(address => uint256) private numOfSubTypes;
  mapping(address => UserAuction[]) private userAuctions;

  bytes32 InPInBytes32 = 0x496e500000000000000000000000000000000000000000000000000000000000;
  address[] public userAddresses;

  // Events just called in transactions, not in calls.
  event LogNewUser (address sender, uint idUser, bytes32 email, bytes32 role);
  event LogNewPeeringNode (address sender, bytes32 idPeeringNode, bytes32 location);
  event LogNewLinks (address sender, bytes32[] idLinks);
  event LogErrors(string error);
  event LogResourceMatched(address InP, bytes32 idPeerNode, bytes32 subNodeType, uint8 cost, bytes32 idVirtualNode, uint8 upperBound);
  event LogAuctionOpened(address auctionAddr, uint256 endTime, bool areOpened);
  event LogAuctionDeleted(address auctionAddr, bool areDeleted);


  function isUserRegistered(address userAddress) public constant returns(bool isIndeed) {
    if (userAddresses.length == 0) return false;
    return (userAddresses[users[userAddress].idUser] == userAddress);
  }

  modifier isUserInP(address sender) {
    require(users[sender].role == InPInBytes32); _;
  }

  // Adds a new user to the contract
  function insertUser(address userAddress, bytes32 email, bytes32 role, bytes32 name) public {
    //require(thing, "Thing is invalid");
    if (isUserRegistered(userAddress)) {
      LogErrors("User is already registered");
      return;
    }
    users[userAddress].name = name;
    users[userAddress].email = email;
    users[userAddress].role = role;
    users[userAddress].idUser = userAddresses.push(userAddress)-1; //since .push() returns the new array length
    LogNewUser(userAddress, users[userAddress].idUser, email, role);
  }

  // Gets all the InPs
  function getInPs() public constant returns (address[]) {
    address[] memory InPs = new address[](userAddresses.length);
    for(uint i = 0; i < userAddresses.length; i++) {
      if (users[userAddresses[i]].role == InPInBytes32) {
        InPs[i] = userAddresses[i];
      }
    }
    return InPs;
  }

  function getAllUsers() public constant returns (address[]) {
    return userAddresses;
  }

  // Gets peering nodes from the sender
  function getPeeringNodes() public constant isUserInP(msg.sender) returns (bytes32[], bytes32[], int[], int[]) {
    var nodes = peeringNodes[msg.sender];
    bytes32[] memory idsPeerNodes = new bytes32[](nodes.length);
    bytes32[] memory locations = new bytes32[](nodes.length);
    int[] memory x = new int[](nodes.length);
    int[] memory y = new int[](nodes.length);

    for (uint i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      idsPeerNodes[i] = node.idPeeringNode;
      locations[i] = node.location;
      x[i] = node.x;
      y[i] = node.y;
    }
    return (idsPeerNodes, locations, x, y);
  }

  function getMatchedVirtualNodes(address InP, bytes32[] idVirtualNodes, bytes32[] locations, bytes32[] resourceTypes) public constant returns (bytes32[]) {
    bytes32[] memory virtualNodes = new bytes32[](numOfSubTypes[InP]);
    uint8 counter = 0;
    for (uint i = 0; i < locations.length; i++) {
      for (uint j = 0; j < peeringNodes[InP].length; j++) {
        if (locations[i] == peeringNodes[InP][j].location) {
          var peeringNode = peeringNodes[InP][j];
          for (uint k = 0; k < peeringNode.resourceTypes.length; k ++) {
            if (resourceTypes[i] == peeringNode.resourceTypes[k]) {
              virtualNodes[counter] = idVirtualNodes[i];
              counter ++;
            }
          }
        }
      }
    }
    return virtualNodes;
  }

  // InP adds a peering node
  function addPeeringNode(bytes32 idPeeringNode, bytes32 location, int x, int y, bytes32[] subNodeTypes) public isUserInP(msg.sender) {
    peeringNodes[msg.sender].push(PeeringNode({idPeeringNode: idPeeringNode, location: location, x: x, y: y, resourceTypes: subNodeTypes}));
    numOfSubTypes[msg.sender] += subNodeTypes.length;
    LogNewPeeringNode(msg.sender, idPeeringNode, location);
  }

  // Get resourceTypes from a peering node
  function getResourceTypes(bytes32 idPeeringNode) public constant isUserInP(msg.sender) returns(bytes32[]){
    var nodes = peeringNodes[msg.sender];
    for (uint i = 0; i < nodes.length; i++) {
      if (idPeeringNode == nodes[i].idPeeringNode) {
        return nodes[i].resourceTypes;
      }
    }
  }


  // Get Peering links from a peering node
  function getPeeringLink(bytes32 idPeeringNode) public constant isUserInP(msg.sender) returns (bytes32[], bytes32[], bytes32[], uint8[]) {
    var linksPeeringNode = links[idPeeringNode];
    bytes32[] memory idLinks = new bytes32[](linksPeeringNode.length);
    bytes32[] memory froms = new bytes32[](linksPeeringNode.length);
    bytes32[] memory tos = new bytes32[](linksPeeringNode.length);
    uint8[] memory capacities = new uint8[](linksPeeringNode.length);
    for (uint i = 0; i<linksPeeringNode.length; i++) {
      idLinks[i] = linksPeeringNode[i].idLink;
      froms[i] = linksPeeringNode[i].from;
      tos[i] = linksPeeringNode[i].to;
      capacities[i] = linksPeeringNode[i].capacity;
    }
    return (idLinks, froms, tos, capacities);
  }

  // Add peering links to a peering node
  function addPeeringLinks(bytes32[] idLinks, bytes32[] from, bytes32[] to, uint8[] capacities) public isUserInP(msg.sender) {
    for (uint i = 0; i<idLinks.length; i++) {
      links[from[i]].push(Link({idLink: idLinks[i], from: from[i], to: to[i], capacity: capacities[i]}));
    }
    LogNewLinks(msg.sender, idLinks);
  }

  function addOpenedAuction(address[] InPs, address auctionAddr, uint256 endTime) public {

    userAuctions[msg.sender].push(UserAuction({auctionAddr: auctionAddr, isOpened: true, endTime: endTime}));
    for (uint i = 0; i<InPs.length; i++) {
      userAuctions[InPs[i]].push(UserAuction({auctionAddr: auctionAddr, isOpened: true, endTime: endTime}));
    }
    LogAuctionOpened(auctionAddr, endTime, true);
  }

  function closeAuction(address[] InPs, address auctionAddr) public {
    for (uint i = 0; i < InPs.length; i++) {
      for (uint j = 0; j < userAuctions[InPs[i]].length; j++) {
        if (userAuctions[InPs[i]][j].auctionAddr == auctionAddr) {
          userAuctions[InPs[i]][j].isOpened = false;
        }
      }
    }
    for (uint k = 0; k < userAuctions[msg.sender].length; k++) {
      if (userAuctions[msg.sender][k].auctionAddr == auctionAddr) {
        userAuctions[msg.sender][k].isOpened = false;
      }
    }
    LogAuctionDeleted(auctionAddr, true);
  }

  function getUserAuctions() public constant returns (address[], bool[], uint256[]) {
    var auctions = userAuctions[msg.sender];
    address[] memory auctionAddrs = new address[](auctions.length);
    bool[] memory isOpened = new bool[](auctions.length);
    uint256[] memory endTime = new uint256[](auctions.length);
    for (uint i = 0; i < auctions.length; i++) {
      auctionAddrs[i] = auctions[i].auctionAddr;
      isOpened[i] = auctions[i].isOpened;
      endTime[i] = auctions[i].endTime;
    }
    return (auctionAddrs, isOpened, endTime);
  }

}
