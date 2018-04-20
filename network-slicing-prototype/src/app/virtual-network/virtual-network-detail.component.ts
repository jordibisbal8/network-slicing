import {Component, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {VirtualNetworkService} from "../services/virtual-network.service";
import {MdDialog, MdSnackBar} from "@angular/material";
import {VirtualNodeDialogComponent} from "./dialogs/virtual-node.dialog.component";
import {AuthService} from "../auth/auth.service";
import {AuctionResultDialogComponent} from "./dialogs/auction-result.dialog.component";

declare let vis: any; // load library also in index.html

@Component({
  selector: 'virtual-network-detail',
  templateUrl: './virtual-network-detail.component.html',
})
export class VirtualNetworkDetailComponent {

  auctionAddr;
  public network;
  public nodes;
  public edges;
  public user;

  public isPackageAllowed: boolean;
  public packageUpperBoundCost: number = 0;
  public packageBidValue: number;
  public owner;

  public idVirtualNodes: string[] = [];
  public bidValues: number[] = [];

  public isLoading: boolean;

  public now: number = new Date().getTime() / 1000; // to convert it to number
  public endTime: number;
  public endTimeinDateFormat;
  public ended: boolean;

  public packageWinner;
  public reservedPackagePrice: number;

  @ViewChild('mynetwork') public container;

  constructor(public router: Router,
              public route: ActivatedRoute,
              public virtualNetworkService: VirtualNetworkService,
              public authService: AuthService,
              public dialog: MdDialog,
              public snackBar: MdSnackBar) {
    this.route.url.subscribe((value) => {
      this.auctionAddr = value[1].path;
    });
    this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.virtualNetworkService.getVirtualNetwork(this.auctionAddr).subscribe((res) => {
      if (res.endTime) {
        this.endTime = res.endTime;
        this.endTimeinDateFormat = new Date().setTime(1000 * this.endTime);
      }
      this.isPackageAllowed = res.isPackageAllowed;
      this.owner = res.owner;
      res.virtualNodes.forEach(virtualNode => {
        virtualNode.label = virtualNode.type;
        virtualNode.title = virtualNode.location;
        if (this.isPackageAllowed && this.now < this.endTime) {
          this.packageUpperBoundCost += virtualNode.upperBoundCost;
          virtualNode.color = {background: '#009688'};
        }
        else if (virtualNode.InPs.indexOf(this.user) > -1 &&  this.now < this.endTime) {
          virtualNode.color = {background: '#009688'};
        }
        else if (res.hasEnded || res.owner === this.user)
          virtualNode.color = {background: 'white'};
        else
          virtualNode.color = {background: 'pink'};

        this.nodes.add(virtualNode);
      });
      res.virtualLinks.forEach(virtualLink => {
        virtualLink.label = virtualLink.dBandwidth;
        this.edges.add(virtualLink);
      });

      if (res.hasEnded) {
        this.ended = res.hasEnded;
        this.packageWinner = res.packageWinner;
        this.reservedPackagePrice = res.reservedPackagePrice;
        this.showResult();
      }
    });
    this.nodes = new vis.DataSet([]);
    this.edges = new vis.DataSet([]);
    let data = {
      nodes: this.nodes,
      edges: this.edges,
    };

    let options = {
      nodes: {
        physics: false,
        shape: 'box',
        widthConstraint:
          {minimum: 40},
        heightConstraint:
          {minimum: 40},
        color: {
          background: 'white',
          border: 'black',
          highlight: {background: 'white', border: 'black'}, hover: {background: 'white', border: 'black'}
        },
        font: {
          size: 30,
        },
        group: 0,
        size: 27,
        shapeProperties: {borderRadius: 0},
      },
      edges: {
        font: {align: 'top'},
        smooth: false,
      },
      interaction: {hover: true},
      manipulation: {
        enabled: false
      }
    };
    // initialize your network!
    this.network = new vis.Network(this.container.nativeElement, data, options);
    this.network.on("doubleClick", params => {
      if (params.nodes[0]) {
        this.nodes.forEach(node => {
          if (node.id === params.nodes[0]) {
            let dialogRef = this.dialog.open(VirtualNodeDialogComponent, {
              width: '1000px'
            });
            node.bid = this.bidValues[this.idVirtualNodes.indexOf(node.id)];
            dialogRef.componentInstance.inputNode = node;
            dialogRef.componentInstance.biddingMode = (node.InPs.indexOf(this.user) > -1 || this.isPackageAllowed) && this.now < this.endTime;
            dialogRef.afterClosed().subscribe((bid: number) => {
              if (bid) {
                let index = this.idVirtualNodes.indexOf(node.id);
                if (index > -1) {
                  this.bidValues[index] = bid;
                }
                else {
                  this.idVirtualNodes.push(node.id);
                  this.bidValues.push(bid);
                }
              }
            })
          }
        });
      }
    });
  }

  bid() {
    this.isLoading = true;
    if (this.bidValues === this.nodes.length) {
      confirm('Your individual bids will be sumed and treated as a package bid. Is that ok?')
    }
    this.virtualNetworkService.bidding(this.idVirtualNodes, this.bidValues, this.auctionAddr)
      .subscribe((res) => {
        this.snackBar.open("Your bids have been sent", 'X', {
          duration:5000
        });
        this.isLoading = false;
      },
      err => {
        window.alert(err._body);
        this.isLoading = false;
      });
  }

  packageBid() {
    this.isLoading = true;
    this.virtualNetworkService.packageBidding(this.packageBidValue, this.auctionAddr)
      .subscribe((res) => {
        this.snackBar.open("Your bid has been sent", 'X', {
          duration:5000
        });
        this.isLoading = false;
      },
    err => {
      window.alert(err._body);
      this.isLoading = false;
    });
  }

  endAuction() {
    this.isLoading = true;
    this.virtualNetworkService.partitioning(this.auctionAddr,this.nodes.map(x => x.id))
      .subscribe((res) => {
        this.isLoading = false;
      },
      err => {
        window.alert(err._body);
        this.isLoading = false;
      })
  }

  isBigger() {
    if (this.packageBidValue > this.packageUpperBoundCost) {
      alert('You bid value must be smaller than the upper bound cost');
      this.packageBidValue = null;
    }
  }

  showResult() {
    let dialogRef = this.dialog.open(AuctionResultDialogComponent, {
      width: '1000px'
    });
    dialogRef.componentInstance.packageValue = this.reservedPackagePrice;
    dialogRef.componentInstance.inputNodes = this.nodes._data;
    dialogRef.componentInstance.packageWinner = this.packageWinner;
    dialogRef.componentInstance.user = this.user;
  }
}
