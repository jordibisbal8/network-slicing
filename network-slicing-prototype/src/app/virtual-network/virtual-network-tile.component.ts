import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: 'virtual-network-tile',
  templateUrl: './virtual-network-tile.component.html'
})
export class VirtualNetworkTileComponent implements OnInit {

  @Input() auction;

  constructor(){

  }

  ngOnInit(){
    this.auction.endTime = new Date().setTime(1000 * this.auction.endTime);

  }
}
