
import {Router} from "@angular/router";
import {Component, OnInit, ViewEncapsulation} from "@angular/core";

const Web3 = require('web3');
const contract = require('truffle-contract');
const productFactoryArtifacts = require('../../build/contracts/ProductFactory.json');
const UserArtifacts = require('../../build/contracts/User.json');


declare let window: any;

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  public user;
  public loginMode: boolean;
  public inputEmail: string;
  public inputPassword: string;

  constructor(
    public router: Router,
  ) {
  }

  toggleLoginMode(){
    this.loginMode = !this.loginMode;
  }

  login() {
    alert('Coming soon');
  }
}
