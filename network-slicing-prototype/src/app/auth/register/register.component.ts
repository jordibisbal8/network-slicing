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
    this.web3.eth.sendTransaction({from: this.web3.eth.accounts[0], to: this.newAddress, value: this.web3.toWei(500, "ether")});
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
    this.authService.register(this.inputAddress, this.inputEmail, this.inputRole);
  }

}

