import {Router} from "@angular/router";
import {Component, OnInit} from "@angular/core";
import {HttpClient} from "../http-client.component";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  public user;

  constructor(public router: Router,
              private authService: AuthService) {
    this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }


  ngOnInit() {
  }

}

