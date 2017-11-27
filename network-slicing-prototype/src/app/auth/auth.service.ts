import { Injectable } from '@angular/core';
import {map} from "rxjs/operator/map";
import {logger} from "codelyzer/util/logger";
const Web3 = require('web3');
const UserArtifacts = require('../../../build/contracts/User.json');
const contract = require('truffle-contract');
declare let window: any;


@Injectable()

export class AuthService {
  web3: any;
  public User = contract(UserArtifacts);

  login(){
    //TODO WE CAN UNLOCK THE ACCOUNT
  }
  register(password){
    // TODO change the parameters.
    this.web3.personal.newAccount(password);
    this.web3.personal.unlockAccount(this.web3.personal.listAccounts[this.web3.personal.listAccounts.length -1], password,15000);
    this.User.deployed().then(contractInstance => {
        contractInstance.insertUser(this.web3.eth.accounts[0], 'jordibisbal8@gmail.com', 'admin',
          {from: this.web3.eth.accounts[0], gas: 1400000}).subscribe(v => {
            return v;
          })
    })
  }
}
