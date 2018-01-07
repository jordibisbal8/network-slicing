import {Router} from "@angular/router";
import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {AuthService} from "./auth/auth.service";
import {AddressValidation} from "./auth/validator/addressValidation";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import Web3 from 'web3';


@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  public user;
  public loginMode: boolean;
  public inputAddress:string;
  loginForm: FormGroup;
  web3: any;
  ether:number;

  constructor(
    public router: Router,
    private authService: AuthService,
    public fb: FormBuilder
  ) {
    this.loginForm = fb.group({
      address: ['', Validators.required],
    }, {
      validator: AddressValidation.isAddressValid
    });
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    );
    this.authService.user.subscribe((user) => {
      this.user = user;
      if (this.user)
        this.ether = this.web3.fromWei(this.web3.eth.getBalance(this.user), "ether");
    });

  }

  toggleLoginMode(){
    this.loginMode = !this.loginMode;
  }

  login() {
    this.authService.login(this.inputAddress);
    this.loginMode = false;
  }

  logout() {
    this.authService.logout();
  }
}
