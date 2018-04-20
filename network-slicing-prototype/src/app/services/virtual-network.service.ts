import {Injectable} from '@angular/core';
import {HttpClient} from "../http-client.component";

@Injectable()
export class VirtualNetworkService {
  constructor(public http: HttpClient)
  {}

  getAuctions() {
    let url = '/api/user/auctions';
    return this.http.get(url)
      .map(res => res.json())
  }
  getVirtualNetwork(auctionAddr) {
    let url = '/api/virtual-network/' + auctionAddr;
    return this.http.get(url)
      .map(res => res.json())
  }
  // Method that post the virtual network request (virtual nodes + bandwidth demands)
  sendVirtualNetwork(data) {
    let url = '/api/virtual-network';
    return this.http.post(url,data)
      .map(res => res.json())
  }

  bidding(idVirtualNodes, values, auctionAddr) {
    let url = '/api/virtual-network/bidding';
    return this.http.post(url, JSON.stringify({idVirtualNodes: idVirtualNodes, values: values, auctionAddr: auctionAddr}))
      .map(res => res.json())
  }

  packageBidding(value, auctionAddr) {
    let url = '/api/virtual-network/package-bidding';
    return this.http.post(url, JSON.stringify({value: value, auctionAddr: auctionAddr}))
      .map(res => res.json())
  }

  partitioning(auctionAddr, idVirtualNodes) {
    let url = '/api/virtual-network/partitioning';
    return this.http.post(url, JSON.stringify({auctionAddr: auctionAddr, idVirtualNodes: idVirtualNodes}))
      .map(res => res.json())
  }
}
