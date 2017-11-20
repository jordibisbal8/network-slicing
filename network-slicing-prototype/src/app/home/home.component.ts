import {Router} from "@angular/router";
import {Component, OnInit} from "@angular/core";

@Component({
  selector: 'home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(public router: Router,) {
  }

  ngOnInit() {
  }
}

