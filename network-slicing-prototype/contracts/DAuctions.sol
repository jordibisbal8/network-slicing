pragma solidity ^0.4.0;


contract DAuction {

  address _owner;
  uint256 _auctionEnd;

  // Current state of the auction.
  address public _highestBidder;
  uint256 public _highestBid;
  uint256 _reservePrice;

  // Set to true at the end, bid has been payed.
  bool _ended;

  modifier onlyAtEnd(uint _time) { require(now >= _time); _; }
  modifier isOwner() { require(msg.sender == _owner); _; }


  event AuctionEnded(address winner, uint amount);

  /// Create a simple auction with auctionEnd
  /// seconds bidding time on behalf of the
  /// address `msg.sender` with a reserve price of 'reservePrice';
  function DAuction(uint256 reservePrice, uint256 auctionEnd) public {
    _reservePrice = reservePrice;
    _auctionEnd = auctionEnd;
  }

  function finalize() public onlyAtEnd(_auctionEnd) isOwner() returns (bool){
    require(!_ended); // this function has already been called_ended = true;
    _ended = true;
    AuctionEnded(_highestBidder, _reservePrice);
    //In DVickreyAuction, the difference between the first and the second bid value should be sent.
    // TODO payed from the contract, transfer or sent?
    _highestBidder.transfer(_highestBid - _reservePrice);
    // TODO Should be payed from the owner or notify the owner and then make the payment
    //_highestBidder.transfer(_reservePrice);
    // TODO service should start
    return true;
  }
}

contract DVickreyAuction is DAuction {

  uint256 public _commitTimePeriod;
  uint256 public _bidDepositAmount;
  uint public _revealTimePeriod;

  // TODO multiple bids
  struct Bid {
    bytes32 bidCommit;
    bool isOpened;
  }

  mapping(address => Bid) public bids;

  modifier onlyBefore(uint _time) { require(now < _time); _; }
  modifier onlyAfter(uint _time) { require(now > _time); _; }

  // constructor
  function DVickreyAuction(uint256 reservePrice, uint256 commitTimePeriod, uint256 revealTimePeriod, uint256 bidDepositAmount) public DAuction(reservePrice, revealTimePeriod) {
    _bidDepositAmount = bidDepositAmount;
    _commitTimePeriod = commitTimePeriod; // number of seconds since Jan 1 1970.From JS Date.getTime()
    _revealTimePeriod = revealTimePeriod; // number of seconds since Jan 1 1970.
    _owner = msg.sender;
  }

  // Receives a SHA3 hash of the value
  // msg.sender will be the contract calling the contract.
  // tx.origin will be the account that initiated the chain of contract calls.
  function commitBid(bytes32 bidCommitment) public payable onlyBefore(_commitTimePeriod) returns(bytes32 bidCommit) {
    require(msg.value >= _bidDepositAmount);
    bids[tx.origin].bidCommit = bidCommitment;
    bids[tx.origin].isOpened = false;
    return bidCommitment;
  }

  // Bidders reveal their bids
  function revealBid() public onlyAfter(_commitTimePeriod) onlyBefore(_revealTimePeriod) payable returns(bool isRevealed) {
    if (bids[tx.origin].bidCommit == keccak256(msg.value) && bids[tx.origin].isOpened == false) {
      if (msg.value > _reservePrice) {
        if (_highestBidder != 0) {
          _highestBidder.transfer(_highestBid); // old highest bidder refunded
        }
        _reservePrice = _highestBid; //reserve price in this case is the second higher bid.
        _highestBid = msg.value;
        _highestBidder = tx.origin;
        tx.origin.transfer(_bidDepositAmount);
      }
      else {
        tx.origin.transfer(msg.value + _bidDepositAmount); // losing bidders get bid amount + bid deposit refunded
      }
      bids[tx.origin].isOpened = true;
      return true;
    }
    return false;
  }
}

contract DAuctions {

  mapping(uint256 => DVickreyAuction) auctions;
  uint256 numAuctions;

  //events
  event NewBid(bytes32 bidCommitment);
  event BidRevealed(bool isRevealed);

  function beginVickreyAuction(uint256 reservePrice, uint256 commitTimePeriod, uint256 revealTimePeriod, uint256 bidDepositAmount) public {
    auctions[numAuctions] = new DVickreyAuction(reservePrice, commitTimePeriod, revealTimePeriod, bidDepositAmount);
    numAuctions++;
  }

  function commitBid(uint256 id, bytes32 bidCommitment) public payable {
    NewBid(auctions[id].commitBid.value(msg.value)(bidCommitment));
  }

  function revealBid(uint256 id) public payable {
    BidRevealed(auctions[id].revealBid.value(msg.value)());
  }

  function finalize(uint256 id) public {
    auctions[id].finalize();
  }

  function getAllAuctions() public constant returns (DVickreyAuction[]) {
    DVickreyAuction[] memory dAuctions = new DVickreyAuction[](numAuctions);
    for(uint i = 0; i < numAuctions; i++) {
      dAuctions[i] = auctions[i];
    }
    return dAuctions;
  }

  function getAllOpenAuctions() public constant returns (DVickreyAuction[]) {
    DVickreyAuction[] memory dAuctions = new DVickreyAuction[](numAuctions);
    for(uint i = 0; i < numAuctions; i++) {
      if (now <= auctions[i]._commitTimePeriod()){
        dAuctions[i] = auctions[i];
      }
    }
    return dAuctions;
  }

  function getHighestBid(uint256 id) public constant returns (uint256 highestBid) {
    return auctions[id]._highestBid();
  }

  function getHighestBidder(uint256 id) public constant returns (address highestBidder) {
    return auctions[id]._highestBidder();
  }
  function getTime() public constant returns (uint256 time){
    return now;
  }
  function getSha3(uint256 x, uint256 y) public constant returns (bytes32) {
    return sha3(x,y);
  }
  function getCommitBids(uint256 id) public constant returns (bytes32,bool) {
    return auctions[id].bids(msg.sender);
  }
}
