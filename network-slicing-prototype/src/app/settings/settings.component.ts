import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

@Component({
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

  constructor(
    public router: Router
  ) {
  }

  ngOnInit() {
  }
}
