import {Injectable} from '@angular/core';
import {HttpClient} from "../http-client.component";

@Injectable()
export class VnService {
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
