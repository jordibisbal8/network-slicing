pragma solidity ^0.4.0;


contract DVickreyAuction {

  uint256 public _commitTimePeriod;
  uint public _revealTimePeriod;

  address public _owner;
  address[] public members; // TODO

  // Set to true at the end, bid has been payed.
  bool public _ended;
  enum resourceType {COMPUTING, STORAGE, CLOUD} //TODO

  // Current state of the auction.
  address public _highestBidder;
  uint256 public _highestBid;
  uint256 public _reservePrice;
  uint256 public _upperBoundPrice;

  // TODO multiple bids
  struct Bid {
    bytes32 bidCommit;
    bool isOpened;
    uint256 bidDeposit;
    //uint nodeIndex; TODO
  }
  struct Node {
    uint index;
    resourceType resource;
    uint256 x;
    uint256 y;
    bytes32 location;
    // address  highestBidder; TODO with multiple items
}

  struct Link {
    uint index;
    uint from; // node index
    uint to; //node index
  }

  Node[] private nodesList;
  Link[] private linksList;

  mapping(address => Bid) public bids;
  //mapping(address => Bid[]) public bids; TODO

  modifier onlyBefore(uint _time) { require(now < _time); _; }
  modifier onlyAfter(uint _time) { require(now > _time); _; }
  modifier isOwner(address sender) { require(sender == _owner); _; }

  // constructor
  function DVickreyAuction(uint256 upperBoundPrice, uint256 commitTimePeriod, uint256 revealTimePeriod, address owner) {
    _upperBoundPrice = upperBoundPrice;
    _commitTimePeriod = commitTimePeriod; // number of seconds since Jan 1 1970.From JS Date.getTime()
    _revealTimePeriod = revealTimePeriod; // number of seconds since Jan 1 1970.
    _owner = owner;
    _ended = false;
    _highestBid = 0; //the highestBid is the minimum one.
  }

  // Receives a SHA3 hash of the value
  // msg.sender will be the contract calling the contract.
  function commitBid(bytes32 bidCommitment, address sender) public payable onlyBefore(_commitTimePeriod) returns(bytes32 bidCommit) {
    /*bids[sender].push(Bid({
      bidCommit: bidCommitment,
      isOpened: false,
      bidDeposit: msg.value
    })); TODO*/
    bids[sender].bidCommit = bidCommitment;
    bids[sender].isOpened = false;
    bids[sender].bidDeposit = msg.value;
    return bids[sender].bidCommit;
  }

  // Bidders reveal their bids
  function revealBid(uint256 value, uint256 valueInEth, address sender) public onlyAfter(_commitTimePeriod) onlyBefore(_revealTimePeriod) returns(bool isRevealed) {
    if (bids[sender].bidCommit == keccak256(value) && bids[sender].isOpened == false) {
      if (valueInEth > _upperBoundPrice) {
        bids[sender].isOpened = true;
        return false;
      }
      if (placeBid(valueInEth, sender)){
        // TODO tell that user is the winner ATM...?
      }
      uint256 refund;
      refund += bids[sender].bidDeposit;
      bids[sender].isOpened = true;
      // Only the 70% of the bid is given back
      sender.transfer((refund * 7 / 100));
      return true;
    }
    return false;
  }

  // This is an "internal" function which means that it
  // can only be called from the contract itself (or from
  // derived contracts).
  function placeBid(uint256 value, address sender) internal returns (bool success) {
    // lowest bid wins
    if (value >= _highestBid) {
      return false;
    }
    if (_highestBidder != 0) {
      _highestBidder.transfer((_highestBid * 7 / 100)); // old highest bidder refunded
    }
    // First Bid case
    if (_highestBid == 0) {
      _reservePrice = value;
    }
    else {
      _reservePrice = _highestBid; //reserve price in this case is the second higher bid.
    }
    _highestBid = value;
    _highestBidder = sender;
    return true;
  }

  function finalize(address sender) public onlyAfter(_revealTimePeriod) isOwner(sender) returns (uint256){
    require(!_ended);
    _ended = true;
    // give back the highestBid to the highestBidder
    _highestBidder.transfer(_highestBid);
    // TODO Owner should transfer to highestBidder the _reservePrice, service should start (contract created).
    return _reservePrice;
  }
}

contract DAuctions {

  //mapping(address => DVickreyAuction) auctions;
  uint256 numAuctions;
  address [] auctionList;

  //events
  event NewAuction(address auctionAddr);
  event NewBid(bytes32 bidCommitment, address sender);
  event BidRevealed(bool isRevealed);
  event IsFinished(uint256 reservePrice, address highestBidder);

  function beginVickreyAuction(uint256 upperBoundPrice, uint256 commitTimePeriod, uint256 revealTimePeriod) public {
    auctionList.push(new DVickreyAuction(upperBoundPrice, commitTimePeriod, revealTimePeriod, msg.sender));
    numAuctions++;
    NewAuction(auctionList[numAuctions-1]);
  }

  function commitBid(address auctionAddr, bytes32 bidCommitment) public payable {
    NewBid(DVickreyAuction(auctionAddr).commitBid.value(msg.value)(bidCommitment, msg.sender), msg.sender);
  }

  function revealBid(address auctionAddr, uint256 value, uint256 valueInEther) public {
    BidRevealed(DVickreyAuction(auctionAddr).revealBid(value, valueInEther, msg.sender));
  }

  function finalize(address auctionAddr) public {
    return IsFinished(DVickreyAuction(auctionAddr).finalize(msg.sender), DVickreyAuction(auctionAddr)._highestBidder());
  }

  function getAllAuctions() public constant returns (address[]) {
    return auctionList;
  }

  function getAllAuctionsForCommit() public constant returns (address[]) {
    address[] memory dAuctions = new address[](numAuctions);
    for(uint i = 0; i < numAuctions; i++) {
      if (now <= DVickreyAuction(auctionList[i])._commitTimePeriod()){
        dAuctions[i] = auctionList[i];
      }
    }
    return dAuctions;
  }
  function getAllAuctionsForReveal() public constant returns (address[]) {
    address[] memory dAuctions = new address[](numAuctions);
    for(uint i = 0; i < numAuctions; i++) {
      if ((DVickreyAuction(auctionList[i])._commitTimePeriod() <= now)
        && (now <= DVickreyAuction(auctionList[i])._revealTimePeriod())
      ){
        dAuctions[i] = auctionList[i];
      }
    }
    return dAuctions;
  }
  // msg.sender in call() not set properly
  function getAllEndedAuctions(address sender) public constant returns (address[]) {
    address[] memory dAuctions = new address[](numAuctions);
    for(uint i = 0; i < numAuctions; i++) {
      if (now >= DVickreyAuction(auctionList[i])._revealTimePeriod()
          && DVickreyAuction(auctionList[i])._owner() == sender
          && DVickreyAuction(auctionList[i])._ended() == false
      ){
        dAuctions[i] = auctionList[i];
      }
    }
    return dAuctions;
  }

  function getHighestBid(address auctionAddr) public constant returns (uint256 highestBid) {
    return DVickreyAuction(auctionAddr)._highestBid();
  }

  function getHighestBidder(address auctionAddr) public constant returns (address highestBidder) {
    return DVickreyAuction(auctionAddr)._highestBidder();
  }
  function getTime() public constant returns (uint256 time){
    return now;
  }
  // keccack256 == sha3 in Solidity
  function getSha3(uint256 x, uint256 y) public constant returns (bytes32) {
    return keccak256(x,y);
  }
  function getCommitBids(address auctionAddr, address sender) public constant returns (bytes32,bool,uint256) {
    return DVickreyAuction(auctionAddr).bids(sender);
  }
}
