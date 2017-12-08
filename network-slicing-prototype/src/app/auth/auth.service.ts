import {Injectable, OnInit} from '@angular/core';
import {Http, Headers} from "@angular/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CheckSignatureDialogComponent} from "./login/check-signature.dialog.component";
import {MdDialog, MdSnackBar} from "@angular/material";
import {Router} from "@angular/router";
const Web3 = require('web3');


@Injectable()

export class AuthService{
  public token = new BehaviorSubject(null);
  public address: string;
  web3: any;

  constructor(public http: Http,
              public dialog: MdDialog,
              public snackBar: MdSnackBar,
              public router: Router){

  }
  isUserLoggedIn(){
    //TODO check if token is still valid
  }
  login(address) {
    let dialogRef = this.dialog.open(CheckSignatureDialogComponent, {
      width: '1000px'
    });
    dialogRef.componentInstance.address = address;
    dialogRef.afterClosed().subscribe(message => {
      if (message){
        //this.authenticate(address,message);
        this.snackBar.open("User successfully authenticated, now you are logged in", 'X', {
          duration:5000
        });
        this.router.navigate(['/home']);
      }
    });
  }

  register(address, email, role){
    // TODO first make authentication (login) and then addAccount in User contract
  }

  authenticate(address, message) {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    );
    const msg = new Buffer(message);
    this.web3.eth.sign(address, '0x' + msg.toString('hex'), (err,sig) => {
      let url = '/authenticate';
      let data = {
        address: address,
        message: message,
      };
      this.http.post(url, JSON.stringify(data), this.getHeaders())
        .map(res => res.json())
        .subscribe(res => {
          // TODO UPDATE TOKEN
          // let token = body.token;
          //dispatch({ type: 'SET_AUTH_TOKEN', result: token})
          console.log(res);
        })
    })
  }

  getHeaders() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return {headers: headers};
  }
}
