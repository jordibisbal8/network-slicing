import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {AddressValidation} from "../validator/addressValidation";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MdDialog, MdSnackBar} from "@angular/material";
import {CheckSignatureDialogComponent} from "./check-signature.dialog.component";
import {Router} from "@angular/router";

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  inputAddress: string;
  public isLoading: boolean;
  loginForm: FormGroup;

  constructor(private authService: AuthService,
              public fb: FormBuilder,
              public router: Router) {

    this.loginForm = fb.group({
      address: ['', Validators.required],
    }, {
      validator: AddressValidation.isAddressValid
    })
  }

  login(){
    this.authService.login(this.inputAddress);
  }
}
