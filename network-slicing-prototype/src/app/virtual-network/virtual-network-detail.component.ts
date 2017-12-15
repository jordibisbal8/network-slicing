import {Component} from "@angular/core";
import {Router} from "@angular/router";

@Component({
  selector: 'virtual-network-detail',
  templateUrl: './virtual-network-detail.component.html',
})
export class VirtualNetworkDetailComponent {

  constructor(
    public router: Router
  ) {}

}
