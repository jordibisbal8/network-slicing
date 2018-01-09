contract PubSub
{
  address[] subscribers; //users that have committed a bid to the auction.
  address publisher; //auction address

  function PubSub(address auctionAddr) {
    publisher = auctionAddr;
  }

  function subscribe(address user) {
    subscribers.push(user);
  }

  function publish(uint value) {

    for(uint i=0; i<subscribers.length; i++) {
      // do something with subscribers[i]...
    }
  }
}
