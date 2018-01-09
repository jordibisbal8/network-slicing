import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CheckSignatureDialogComponent} from "./login/check-signature.dialog.component";
import {MdDialog, MdSnackBar} from "@angular/material";
import {Router} from "@angular/router";
import Web3 from 'web3';
import {HttpClient} from "../http-client.component";
import {_localeFactory} from "@angular/core/src/application_module";


@Injectable()

export class AuthService{
  public user = new BehaviorSubject(null);
  public ether = new BehaviorSubject(null);
  web3: any;

  constructor(public http: HttpClient,
              public dialog: MdDialog,
              public snackBar: MdSnackBar,
              public router: Router){
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    );
    this.sync();
  }
  sync() {
    // TODO update expiration time of token in server.
    // TODO check in Server and not in localStorage.
    let addr = localStorage.getItem('address');
    if (addr) {
      this.user.next(addr);
      this.ether.next(this.web3.fromWei(this.web3.eth.getBalance(addr), "ether"));
    }
    else
      this.user.next(null);
  }
  isUserLoggedIn(){
    return (!!localStorage.getItem('token'));
  }
  login(address, callback?) {
    let dialogRef = this.dialog.open(CheckSignatureDialogComponent, {
      width: '1000px'
    });
    dialogRef.componentInstance.address = address;
    dialogRef.componentInstance.signMessage = (message,password) => {
      try {
        this.web3.personal.unlockAccount(address, password, 0)
      }
      catch(error) {
        return window.alert(error);
      }
      this.authenticate(address,message, () => {
        this.snackBar.open("User successfully authenticated, you are now logged in", 'X', {
          duration:7000
        });
        dialogRef.close();
        this.router.navigate(['/home']);
        if (callback) callback()
      });
    }
  }

  register(address, email, role){
    // To check if it's the owner of the address
    this.login(address, (res) => {
      let url = '/api/user/';
      this.http.post(url, JSON.stringify({address: address, email:email, role:role}))
        .subscribe(res => {
          this.snackBar.open("User registered in the blockchain", 'X', {
              duration:7000
            });
        },
        err => {
          window.alert(err._body);
        });
    });
  }

  authenticate(address, message, callback) {
    let msg = new Buffer(message);
    this.web3.eth.sign(address, '0x' + msg.toString('hex'), (err,signature) => {
      let url = '/api/authenticate/';
      let data = {
        address: address,
        signature: signature,
        message: message,
      };
      this.http.post(url, JSON.stringify(data))
        .map(res => res.json())
        .subscribe(res => {
          // We store the token locally along with user's address.
          localStorage.setItem('token', res.token);
          localStorage.setItem('address', address);
          this.user.next(address);
          this.ether.next(this.web3.fromWei(this.web3.eth.getBalance(address), "ether"));
          callback();
        },
        err => {
          window.alert(err._body);
        });
    })
  }

  logout() {
    localStorage.removeItem('address');
    this.user.next(null);
  }

}
