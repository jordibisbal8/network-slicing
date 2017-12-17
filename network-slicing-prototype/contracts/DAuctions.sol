pragma solidity ^0.4.0;


contract DAuction {
  // constructor
  function DAuction(uint256 reservePrice, uint256 biddingTimePeriod, address judgeAddress) {
    _reservePrice = reservePrice;
    _judgeAddress = judgeAddress;
    _auctionEnd = now + biddingTimePeriod;
  }

  //events
  event NewBid(address bidder, uint amount);
  event AuctionEnded(address winner, uint amount);

  // Allowed withdrawals of previous bids
  mapping(address => uint) pendingReturns;

  function finalize() {
    require(now >= _auctionEnd); // auction did not yet end
    require(!_ended); // this function has already been called_ended = true;
    _ended = true;
    AuctionEnded(_highestBidder, _reservePrice);
    // if highestBid -> DVickreyAuction, the difference should be returned
    /*if (_highestBid != 0) {
      _highestBidder.transfer(_highestBid - _reservePrice);
    }*/
    _highestBidder.transfer(_reservePrice);
  }

  function refund() returns (bool) {
    uint amount = pendingReturns[msg.sender];
    if (amount > 0) {
      // It is important to set this to zero because the recipient
      // can call this function again as part of the receiving call
      // before `send` returns.
      pendingReturns[msg.sender] = 0;

      if (!msg.sender.send(amount)) {
        // No need to call throw here, just reset the amount owing
        pendingReturns[msg.sender] = amount;
        return false;
      }
    }
    return true;
  }

  // Place your code here
  address _judgeAddress;
  uint256 _reservePrice;
  address _highestBidder;
  uint256 _auctionEnd;
  bool _ended;
  address _owner;
  uint256 _highestBid;

}

contract DDutchAuction is DAuction {


  // constructor
  function DDutchAuction(uint256 reservePrice, address judgeAddress, uint256 biddingPeriod, uint256 offerPriceDecrement) DAuction(reservePrice, biddingPeriod, judgeAddress) {
    _offerPriceDecrement = offerPriceDecrement;
    _biddingPeriod = biddingPeriod;
    _auctionStart = now;
    _auctionEnd = now + biddingPeriod;
    _owner = msg.sender;
  }
  // No amount specified, just bid done in the right time which calculates automatically the price. Only one bid needed.
  function bid() payable returns(address highestBidder) {
    // It is still possible to call a specific
    // overridden function.
    require(now <= _auctionEnd);
    // If the bid is not higher, send the
    // money back.
    require(msg.value > _reservePrice);

    if (highestBidder != 0) {
      // Sending back the money
      pendingReturns[_highestBidder] += _reservePrice;
    }
    _reservePrice = _reservePrice - (_offerPriceDecrement * (now - _auctionStart));
    _highestBidder = msg.sender;
    NewBid(msg.sender, msg.value);
    return _highestBidder;
  }

  uint256 _offerPriceDecrement;
  uint256 _biddingPeriod;
  uint256 _auctionStart;
}

contract DEnglishAuction is DAuction {

  // constructor
  function DEnglishAuction(uint256 reservePrice, address judgeAddress, uint256 biddingTimePeriod, uint256 minBidIncrement) DAuction(reservePrice, biddingTimePeriod, judgeAddress) {
    _minBidIncrement = minBidIncrement;
    _biddingTimePeriod = biddingTimePeriod;
    _owner = msg.sender;

  }

  function bid() payable returns(address highestBidder) {
    require(now <= _auctionEnd);

    // If the bid is not higher, send the
    // money back.
    require(msg.value > _reservePrice + _minBidIncrement);

    if (_highestBidder != 0) {
      // Sending back the money by simply using
      // highestBidder.send(highestBid) is a security risk
      // because it could execute an untrusted contract.
      // It is always safer to let the recipients
      // withdraw their money themselves.
      pendingReturns[_highestBidder] += _reservePrice;
    }
    _highestBidder = msg.sender;
    _reservePrice = msg.value;
    _auctionEnd = now + _biddingTimePeriod;
    NewBid(msg.sender, msg.value);
    return _highestBidder;
  }

  uint256 _biddingTimePeriod;
  uint256 _minBidIncrement;
}

contract DVickreyAuction is DAuction {

  mapping(address => Commit) commitBids;

  struct Commit {
    bytes32 bidCommit;
    bool isOpened;
  }

  // constructor
  function DVickreyAuction(uint256 reservePrice, address judgeAddress, uint256 commitTimePeriod, uint256 revealTimePeriod, uint256 bidDepositAmount) DAuction(reservePrice, commitTimePeriod + revealTimePeriod, judgeAddress) {
    _bidDepositAmount = bidDepositAmount;
    _commitTimePeriod = commitTimePeriod;
    _owner = msg.sender;
  }
  // Receives a SHA3 hash of a 32byte nonce and their bid value
  function commitBid(bytes32 bidCommitment) payable returns(bool) {
    require(now <= _commitTimePeriod);
    require(msg.value >= _bidDepositAmount);
    commitBids[msg.sender].bidCommit = bidCommitment;
    return true;
  }

  function revealBid(bytes32 nonce) payable returns(address highestBidder) {
    if (commitBids[msg.sender].bidCommit == sha3(nonce,msg.value) && commitBids[msg.sender].isOpened == false) {
      pendingReturns[_highestBidder] += _bidDepositAmount;
      require(msg.value > _reservePrice);
      if (_highestBidder != 0) {
        pendingReturns[_highestBidder] += _reservePrice;
      }
      _reservePrice = _highestBid; //reserve price in this case is the second higher bid.
      _highestBid = msg.value;
      _highestBidder = msg.sender;
      commitBids[msg.sender].isOpened = true;
    return _highestBidder;
    }
  }

  function finalize() {
    DAuction.finalize();
  }
  function refund() returns (bool) {
    DAuction.refund();
  }

  uint256 _commitTimePeriod;
  uint256 _bidDepositAmount;
}

contract DAuctions {

  mapping(uint256 => DVickreyAuction) auctions;
  uint256 numAuctions;

  /*function beginDutchAuction(uint256 reservePrice, address judgeAddress, uint256 biddingTimePeriod, uint256 offerPriceDecrement) returns(uint256 auctionID) {
    auctionID = numAuctions++;
    auctions[auctionID] = new DDutchAuction(reservePrice, judgeAddress, biddingTimePeriod, offerPriceDecrement);
    return auctionID;
  }

  function beginEnglishAuction(uint256 reservePrice, address judgeAddress, uint256 biddingTimePeriod, uint256 minBidIncrement) returns(uint256 auctionID) {
    auctionID = numAuctions++;
    auctions[auctionID] = new DEnglishAuction(reservePrice, judgeAddress, biddingTimePeriod, minBidIncrement);
    return auctionID;
  }*/

  function beginVickreyAuction(uint256 reservePrice, address judgeAddress, uint256 commitTimePeriod, uint256 revealTimePeriod, uint256 bidDepositAmount) returns(uint256 auctionID) {
    auctionID = numAuctions++;
    auctions[auctionID] = new DVickreyAuction(reservePrice, judgeAddress, commitTimePeriod, revealTimePeriod, bidDepositAmount);
    return auctionID;
  }

  /*function bid(uint256 id) payable returns(address) {
    //.value(msg.value) to send that parameter
    return auctions[id].bid.value(msg.value)();
  }*/

  function finalize(uint256 id) {
    auctions[id].finalize();
  }

  function refund (uint256 id) payable returns(bool) {
    auctions[id].refund();
  }

  function revealBid(uint256 id, bytes32 nonce) payable returns(address) {
    return auctions[id].revealBid.value(msg.value)(nonce);
  }

  function commitBid(uint256 id, bytes32 bidCommitment) payable returns(bool) {
    return auctions[id].commitBid.value(msg.value)(bidCommitment);
  }
}
