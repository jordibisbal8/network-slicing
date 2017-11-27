import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  inputUser: string;
  inputPassword: string;
  public isLoading: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  login(){
    this.isLoading = true;
  }
}
