import {Router} from "@angular/router";
import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {AuthService} from "./auth/auth.service";
import {AddressValidation} from "./auth/validator/addressValidation";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";


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


  constructor(
    public router: Router,
    private authService: AuthService,
    public fb: FormBuilder
  ) {
    this.loginForm = fb.group({
      address: ['', Validators.required],
    }, {
      validator: AddressValidation.isAddressValid
    })
  }

  toggleLoginMode(){
    this.loginMode = !this.loginMode;
  }

  login() {
    this.authService.login(this.inputAddress);
    this.loginMode = false;
  }
}
