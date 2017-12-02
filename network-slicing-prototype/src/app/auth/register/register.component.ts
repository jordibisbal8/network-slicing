import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {MdDialog} from "@angular/material";
import {CheckSignatureDialogComponent} from "../login/check-signature.dialog.component";
const Web3 = require('web3');
const ethUtil = require('ethereumjs-util');
const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  public inputEmail: string;
  public inputAddress: string;
  public inputPassword: string;
  public inputPassword2: string;
  public inputRole: string;
  public isLoading: boolean;
  public createMode: boolean;
  public newAddress: string;
  web3: any;

  constructor(private authService: AuthService,
              public dialog: MdDialog) {
  }


  register() {

  }
  /*authenticate() {
    this.isLoading = true;
    this.authService.authenticate(this.inputAddress, this.inputMessage);
  }*/

  togglecreateEOA() {
    this.createMode = !this.createMode;
  }

  createEOA(){
    if (this.inputPassword !== this.inputPassword2)
      console.log('The introduced passwords are not identical');
    this.newAddress = this.web3.personal.newAccount(this.inputPassword);
    this.web3.personal.unlockAccount(this.newAddress, this.inputPassword, 0);
    // TODO SHOW NEW ADDRESS TO USER!
    this.togglecreateEOA();
  }
  openDialog(): void {
    let dialogRef = this.dialog.open(CheckSignatureDialogComponent, {
      width: '1000px'
    });
    dialogRef.componentInstance.address = this.inputAddress;

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  isAddress(address) {
    console.log('ei')
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return "true
      return true;
    }
  }

  checkSig() {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    );
    let address = this.web3.eth.accounts[0];
    const msg = new Buffer('hello world');
    this.web3.eth.sign(address, '0x' + msg.toString('hex'), (err,sig) => {
      const signature = ethUtil.fromRpcSig(sig);
      const prefix = new Buffer("\x19Ethereum Signed Message:\n");
      const prefixedMsg = ethUtil.sha3(
        Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
      );

      const pubKey  = ethUtil.ecrecover(prefixedMsg, signature.v, signature.r, signature.s);
      const addrBuf = ethUtil.pubToAddress(pubKey);
      const addr    = ethUtil.bufferToHex(addrBuf);

      console.log(this.web3.eth.accounts[0],  addr);

      if(addr === address) {
        console.log('signature check success');
      } else {
        console.log('signature check FAILED');
      }
    })
  }
}

