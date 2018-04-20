import { Component } from '@angular/core';
import {AuthService} from "../auth.service";
import {MdDialog, MdSnackBar} from "@angular/material";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {PasswordValidation} from "../validator/passwordValidation";
import {AddressValidation} from "../validator/addressValidation";
import {ShowAddressDialogComponent} from "./show-address.dialog.component";
import {Router} from "@angular/router";

import Web3 from 'web3';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  public inputName: string;
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
      name: ['', Validators.required],
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
    this.web3.eth.sendTransaction({from: this.web3.eth.accounts[0], to: this.newAddress, value: this.web3.toWei(100, "ether")});
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

  register() {
    this.authService.register(this.inputAddress, this.inputEmail, this.inputRole, this.inputName);
  }

  test1() {
    this.inputAddress = '0x124547c8ca778d9630ba75d9caff8fe0fe5f2d75';
    this.inputEmail = 'test@gmail.com';
    this.inputName = 'jordi';
    this.inputRole = 'InP';
    this.authService.register(this.inputAddress, this.inputEmail, this.inputRole, this.inputName);
  }
  test2() {
    this.inputAddress = '0x695685829237d41b912a947cf4fe820649ee4db7';
    this.inputEmail = 'test@gmail.com';
    this.inputName = 'jordi';
    this.inputRole = 'InP';
    this.authService.register(this.inputAddress, this.inputEmail, this.inputRole, this.inputName);  }
  test3() {
    this.inputAddress = '0xa5aff7d0ba9c17ae3add40b47ab87a5982c96f95';
    this.inputEmail = 'test@gmail.com';
    this.inputName = 'jordi';
    this.inputRole = 'InP';
    this.authService.register(this.inputAddress, this.inputEmail, this.inputRole, this.inputName);
  }

  test5() {
    this.inputAddress = '0xb00197cd3cde1f7b89f246bf925ccc4df116ee37';
    this.inputEmail = 'test@gmail.com';
    this.inputName = 'jordi';
    this.inputRole = 'InP';
    this.authService.register(this.inputAddress, this.inputEmail, this.inputRole, this.inputName);

  }
  test4() {
    this.inputAddress = '0xd81ba104b3044aeafa12ad7285ed953a6a3045af';
    this.inputEmail = 'test@gmail.com';
    this.inputName = 'jordi';
    this.inputRole = 'SP';
    this.authService.register(this.inputAddress, this.inputEmail, this.inputRole, this.inputName);
  }

}

