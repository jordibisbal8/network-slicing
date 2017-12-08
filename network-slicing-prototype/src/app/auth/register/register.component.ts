import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {MdDialog, MdSnackBar} from "@angular/material";
import {CheckSignatureDialogComponent} from "../login/check-signature.dialog.component";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {PasswordValidation} from "../validator/passwordValidation";
import {AddressValidation} from "../validator/addressValidation";
import {ShowAddressDialogComponent} from "./show-address.dialog.component";
import {Router} from "@angular/router";

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
  form: FormGroup;
  accountForm: FormGroup;

  constructor(private authService: AuthService,
              public snackBar: MdSnackBar,
              public dialog: MdDialog,
              public fb: FormBuilder,
              public router: Router) {
    this.form = fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validator: PasswordValidation.MatchPassword // your validation method
    });
    this.accountForm  = fb.group({
      email: ['', Validators.required],
      address: ['', Validators.required],
      role: ['', Validators.required],
    }, {
      validator: AddressValidation.isAddressValid
    });
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    );
  }


  togglecreateEOA() {
    this.createMode = !this.createMode;
  }

  createEOA(){
    this.newAddress = this.web3.personal.newAccount(this.inputPassword);
    this.web3.personal.unlockAccount(this.newAddress, this.inputPassword, 0);
    let dialogRef = this.dialog.open(ShowAddressDialogComponent, {
      width: '1000px'
    });
    dialogRef.componentInstance.address = this.newAddress;
    dialogRef.afterClosed().subscribe(result => {
      this.snackBar.open("Now you can register on the network slicing application", 'X', {
        duration:5000
      });
    });
    this.togglecreateEOA();
  }
  login() {
    this.authService.login(this.inputAddress);
  }

  /*checkSig() {
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
  }*/

}

