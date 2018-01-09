import {Injectable} from '@angular/core';
import {HttpClient} from "../http-client.component";

@Injectable()
export class AuctionService {
  constructor(public http: HttpClient)
  {}

  getAllUsers() {
    let url = '/api/user';
    return this.http.get(url)
      .map(res => res.json())
  }
  getInPs() {
    let url = '/api/user/InPs';
    return this.http.get(url)
      .map(res => res.json())
  }

  beginAuction(commitTime: Date, revealTime: Date, upperBound: number) {
    let url = '/api/auction';
    let data =
      { commitTime: commitTime.getTime() / 1000,
        revealTime: revealTime.getTime() / 1000,
        upperBound: upperBound
      };
    return this.http.post(url,data)
      .map(res => res.json())
  }

  commitBid(auctionAddr: string, bidValue: number) {
    let url = '/api/auction/commit';
    let data = {auctionAddr: auctionAddr, bidValue: bidValue};
    return this.http.post(url,data)
      .map(res => res.json())
  }

  revealBid(auctionAddr: string, bidValue: number) {
    let url = '/api/auction/reveal';
    let data = {auctionAddr: auctionAddr, bidValue: bidValue};
    return this.http.post(url,data)
      .map(res => res.json())
  }

  getAllAuctions() {
    let url = '/api/auction';
    return this.http.get(url)
      .map(res => res.json())
  }

  getAllAuctionsForCommit() {
    let url = '/api/auction/commit';
    return this.http.get(url)
      .map(res => res.json())
  }

  getAllAuctionsForReveal() {
    let url = '/api/auction/reveal';
    return this.http.get(url)
      .map(res => res.json())
  }

  getAllEndedAuctions() {
    let url = '/api/auction/auctionEnded';
    return this.http.get(url)
      .map(res => res.json())
  }

  finalize(auctionAddr: string) {
    let url = '/api/auction/finalize';
    let data = {auctionAddr: auctionAddr};
    return this.http.put(url,data)
      .map(res => res.json())
  }

  // BE CAREFUL the gas sent should be enough
  /*newContract() {
    this.productFactory.deployed().then(contractInstance => {
      contractInstance.createContract(this.name, {from: this.web3.eth.accounts[0], gas: 1400000})
    })
  }
  getCount() {
    this.productFactory.deployed().then(contractInstance => {
      contractInstance.getContractCount.call().then(v => {
        console.log(v.toNumber());
      })
    })
  }
  getContractByName() {
    this.productFactory.deployed().then(contractInstance => {
      contractInstance.getContractByName(this.name, {
        from: this.web3.eth.accounts[0], gas: 1400000
      }).then(v => {
        console.log(v);
      })
    })
  }
  getAllContracts() {
    this.productFactory.deployed().then(contractInstance => {
      contractInstance.allContracts.call().then(v => {
        console.log(v);
      })
    })
  }

  getUserCountFromFactory(){
    this.User.deployed().then(userContract => {
      this.productFactory.deployed().then(contractInstance => {
        contractInstance.getAllUsers.call(userContract.address).then(v => {
          console.log(v.toNumber());
        })
      })
    })
  }*/
}
