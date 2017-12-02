import {Injectable, OnInit} from '@angular/core';
import {Http, Headers} from "@angular/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
const Web3 = require('web3');


@Injectable()

export class AuthService{
  public token = new BehaviorSubject(null);
  public address: string;
  web3: any;

  constructor(public http: Http){

  }
  isUserLoggedIn(){
    //TODO check if token is still valid
  }
  login(address) {
    // TODO authentication with MW, which creates new token
    // TODO WE CAN UNLOCK THE ACCOUNT same time as token timestamp
  }

  register(address, email, role){
    // TODO first make authentication (login) and then addAccount in User contract
  }
  /*authenticate(sig, user) {
    return (dispatch) => {
      // TODO req.params {owner: user, sig: sig})
      this.http.post('api/authenticate')
        .then((res) => { return res.text(); })
        .then((body) => {
          let token = body.token;
          dispatch({ type: 'SET_AUTH_TOKEN', result: token})
        })
    }
  }*/
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
