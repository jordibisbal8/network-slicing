import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

@Component({
  templateUrl: './virtual-network-list.component.html'
})
export class VirtualNetworkListComponent implements OnInit {

  public name: string;

  constructor(
    public router: Router
  ) {
  }

  ngOnInit() {
    // TODO GET SERVICES WHERE USER IS MEMBER OR OWNER
  }


  openVirtualNetwork() {
    this.router.navigate(['/virtual-network/vn-0']);
  }
}
