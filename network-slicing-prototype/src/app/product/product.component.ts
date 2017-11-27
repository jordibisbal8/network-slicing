import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

const Web3 = require('web3');
const contract = require('truffle-contract');
const productFactoryArtifacts = require('../../../build/contracts/ProductFactory.json');
const UserArtifacts = require('../../../build/contracts/User.json');
declare let window: any;

@Component({
  selector: 'product',
  templateUrl: './product.component.html'
})
export class ProductComponent implements OnInit {

  public productFactory = contract(productFactoryArtifacts);
  public User = contract(UserArtifacts);
  public inputPassword: string;
  web3: any;

  public name: string;

  constructor(
    public router: Router,
  ) {
  }

  checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
      );
    }
    this.productFactory.setProvider(this.web3.currentProvider);
    this.User.setProvider(this.web3.currentProvider);
  };

  ngOnInit() {
  }

  // BE CAREFUL the gas sent should be enough
  newContract() {
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
  insertUser() {
    this.User.deployed().then(contractInstance => {
      console.log(contractInstance);
      contractInstance.insertUser(this.web3.eth.accounts[0], 'jordibisbal8@gmail.com', 'admin',
        {from: this.web3.eth.accounts[0], gas: 1400000}).then(v => {
        console.log(v);
      })
    })
  }
  getUser(){
    this.User.deployed().then(contractInstance => {
      contractInstance.getUser.call(this.web3.eth.accounts[1]).then(v => {
        console.log(this.web3.toUtf8(v[1]));
        console.log(this.web3.toUtf8(v[0]));

      })
    })
  }
  getUserAtIndex(){
    this.User.deployed().then(contractInstance => {
      contractInstance.getUserAtIndex.call(0).then(v => {
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
  }
}
