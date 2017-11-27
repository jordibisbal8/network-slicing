import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {

  public inputName: string;
  public inputLastName: string;
  public inputUsername: string;
  public inputPassword: string;
  public inputUserType: string;
  public isLoading: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  register(){
    this.isLoading = true;
    let res = this.authService.register(this.inputPassword);
    console.log(res);
  }
}
