import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {VirtualNetworkService} from "../services/virtual-network.service";

@Component({
  templateUrl: './virtual-network-list.component.html'
})
export class VirtualNetworkListComponent implements OnInit {

  public openAuctionList = [];
  public endAuctionsList = [];
  public closedAuctionList = [];
  public now: number = new Date().getTime() / 1000; // to convert it to number


  constructor(
    public router: Router,
    public virtualNetworkService: VirtualNetworkService,
  ) {
  }

  ngOnInit() {
    this.virtualNetworkService.getAuctions().subscribe((res) => {
      res.auctions.forEach(auction => {
        if (this.now > auction.endTime && auction.isOpened) {
          auction.ended = true;
          this.endAuctionsList.push(auction);
        }
        else if (!auction.isOpened)
          this.closedAuctionList.push(auction);
        else
          this.openAuctionList.push(auction);
      })
    })
  }


  openAuction(auctionAddr) {
    this.router.navigate(['/virtual-network/' + auctionAddr]);
  }
}
