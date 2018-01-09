import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {AuctionService} from "../services/auction-service";
import {MdSnackBar} from "@angular/material";

@Component({
  selector: 'auctions',
  templateUrl: './auction.component.html',
})
export class AuctionComponent implements OnInit {

  public inputPrice: number;
  public auctionType: string;
  public auctionsCommitList: string [];
  public auctionsRevealList: string [];
  public auctionsEnded: string [];
  public newAuctionMode: boolean;
  public inputUpperBound;
  public inputBidValue: number;

  public settings = {
    timePicker: true,
    format: 'dd-MMM-yyyy hh:mm a',
  };
  public inputRevealTime: Date = new Date();
  public inputCommitTime: Date = new Date();

  public isLoading: boolean;

  constructor(
    public router: Router,
    public auctionService: AuctionService,
    public snackBar: MdSnackBar,

  )
  {
  }

  ngOnInit() {
    this.auctionService.getAllAuctionsForCommit().subscribe((auctions: string []) => {
      this.auctionsCommitList = auctions;
    });
    this.auctionService.getAllAuctionsForReveal().subscribe((auctions: string []) => {
      this.auctionsRevealList = auctions;
    });
    this.auctionService.getAllEndedAuctions().subscribe((auctions: string []) => {
      this.auctionsEnded = auctions;
    })
  }
  beginAuction() {
    if (!this.inputUpperBound)
      alert('Enter an upper bound value');
    else {
      this.isLoading = true;
      this.auctionService.beginAuction(this.inputCommitTime, this.inputRevealTime, this.inputUpperBound).subscribe(auctionAddr => {
        this.auctionsCommitList.push(auctionAddr);
        this.inputUpperBound = null;
        this.newAuctionMode = false;
        this.isLoading = false;
      })
    }
  }

  commitBid(auctionAddr: string) {
    if (!this.inputBidValue)
      alert('Enter a Bid value');
    else {
      this.isLoading = true;
      this.auctionService.commitBid(auctionAddr, this.inputBidValue).subscribe(isCommited => {
        this.snackBar.open("Bid of " + this.inputBidValue +" ETHER successfully committed", 'X', {
            duration:7000
          });
      },
      err => {
        window.alert(err._body);
      });
      this.isLoading = false;
    }
  }
  revealBid(auctionAddr: string) {
    if (!this.inputBidValue)
      alert('Enter a Bid value');
    else {
      this.isLoading = true;
      this.auctionService.revealBid(auctionAddr, this.inputBidValue).subscribe(isRevealed => {
          this.snackBar.open("Bid successfully revealed ( 2 ETHER refunded). The winner will be notified soon", 'X', {
            duration:7000
          });
        },
        err => {
          window.alert(err._body);
        });
      this.isLoading = false;
    }
  }

  finalize(auctionAddr: string){
    this.isLoading = true;
    this.auctionService.finalize(auctionAddr).subscribe(response=> {
        this.snackBar.open("Highest Bidder: " + response.highestBidder + " with reservePrice: " + response.reservePrice + ' ETHER', 'X', {
          duration:7000
        });
      },
      err => {
        window.alert(err._body);
      });
    this.isLoading = false;
  }
  commitTimeChanged(event) {
    this.inputCommitTime = new Date(this.inputCommitTime); //this.inputCommitTime.getTime() / 1000
  }
  revealTimeChanged(event) {
    this.inputRevealTime = new Date(this.inputRevealTime); //this.inputRevealTime.getTime() / 1000
  }
  toggleNewAuction(){
    this.newAuctionMode = !this.newAuctionMode;
  }
}
