pragma solidity ^0.4.0;


contract Users_evaluation {

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
    // evaluation
    uint256[] uCosts;
    uint256[] uCapacities;
    uint256[] capacities;
  }

  struct Link {
    bytes32 idLink;
    bytes32 from;
    bytes32 to;
    uint8 capacity;
  }


  mapping(address => User) private users;
  mapping(address => PeeringNode[]) private peeringNodes;
  mapping(bytes32 => Link[]) private links;
  mapping(address => uint256) private numOfSubTypes;

  // Events just called in transactions, not in calls.
  event LogNewPeeringNode (address sender, bytes32 idPeeringNode, bytes32 location);
  event LogNewLinks (address sender, bytes32[] idLinks);
  event LogErrors(string error);

  bytes32 nullInBytes32 = 0x6e756c6c00000000000000000000000000000000000000000000000000000000;



  function getCostsAndCapacities(bytes32[] locations, bytes32[] resourceTypes) public constant returns (uint256[],uint256[],uint256[], bytes32[]) {
    uint256[] memory uCosts = new uint256[](numOfSubTypes[msg.sender]);
    uint256[] memory uCapacities = new uint256[](numOfSubTypes[msg.sender]);
    uint256[] memory capacities = new uint256[](numOfSubTypes[msg.sender]);
    bytes32[] memory countries = new bytes32[](numOfSubTypes[msg.sender]);
    for (uint i = 0; i < locations.length; i++) {
      for (uint j = 0; j < peeringNodes[msg.sender].length; j++) {
        if (locations[i] == nullInBytes32 || locations[i] == peeringNodes[msg.sender][j].location) {
          var peeringNode = peeringNodes[msg.sender][j];
          for (uint k = 0; k < peeringNode.resourceTypes.length; k ++) {
            if (resourceTypes[i] == peeringNode.resourceTypes[k]) {
              // If location null we return the substrate node data with less used capacity.
              if (uCosts[i] == 0x00000000000000000000 || peeringNode.uCapacities[k] < uCapacities[i]) {
                uCosts[i] = peeringNode.uCosts[k];
                uCapacities[i] = peeringNode.uCapacities[k];
                capacities[i] = peeringNode.capacities[k];
                countries[i] = peeringNode.location;
              }
            }
          }
        }
      }
    }
    return (uCosts, uCapacities, capacities, countries);
  }

  // Updates InP capacities
  function updateCapacities(uint8[] computingDemands, bytes32[] resourceTypes, bytes32[] locations, bool isPlus) {
    for (uint i = 0; i < peeringNodes[msg.sender].length; i++) {
      for (uint k = 0; k < locations.length; k++) {
        var peeringNode = peeringNodes[msg.sender][i];
        if (locations[k] == peeringNode.location) {
          for (uint j = 0; j < peeringNode.resourceTypes.length; j ++) {
            if (resourceTypes[k] == peeringNode.resourceTypes[j]) {
              if (isPlus) {
                peeringNode.uCapacities[j] += computingDemands[k];
              }
              else {
                peeringNode.uCapacities[j] -= computingDemands[k];
              }
            }
          }
        }
      }
    }
  }

  // Updates InP capacity
  function updateCapacity(uint8 computingDemand, bytes32 resourceType, bytes32 location, bool isPlus) {
    for (uint i = 0; i < peeringNodes[msg.sender].length; i++) {
      var peeringNode = peeringNodes[msg.sender][i];
      if (location == peeringNode.location) {
        for (uint j = 0; j < peeringNode.resourceTypes.length; j ++) {
          if (resourceType == peeringNode.resourceTypes[j]) {
            if (isPlus) {
              peeringNode.uCapacities[j] += computingDemand;
            }
            else {
              peeringNode.uCapacities[j] -= computingDemand;
            }
          }
        }
      }
    }
  }


  // InP adds a peering node
  function addPeeringNode(bytes32 idPeeringNode, bytes32 location, bytes32[] subNodeTypes, uint256[] uCosts, uint256[] capacities) {
    peeringNodes[msg.sender].push(PeeringNode({idPeeringNode: idPeeringNode, location: location, resourceTypes: subNodeTypes, uCosts: uCosts, uCapacities: new uint256[](capacities.length), capacities: capacities}));
    numOfSubTypes[msg.sender] += subNodeTypes.length;
    LogNewPeeringNode(msg.sender, idPeeringNode, location);
  }


  // Add peering links to a peering node
  function addPeeringLinks(bytes32[] idLinks, bytes32[] from, bytes32[] to, uint8[] capacities) {
    for (uint i = 0; i<idLinks.length; i++) {
      links[from[i]].push(Link({idLink: idLinks[i], from: from[i], to: to[i], capacity: capacities[i]}));
    }
    LogNewLinks(msg.sender, idLinks);
  }

}

