import {Component, Inject, Input} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";
import {VirtualNode} from "../../model/VirtualNode";
import {Static_Values} from "../../static_values";


@Component({
  selector: 'auction-result',
  templateUrl: './auction-result.dialog.html',
})
export class AuctionResultDialogComponent {

  public packageWinner;
  public packageValue;
  public user;
  public virtualNodes: VirtualNode[] = [];

  private locations = new Static_Values().locations;

  @Input('inputNodes')
  set inputNodes(virtualNodes: VirtualNode[]) {
    for (let i in virtualNodes) {
      virtualNodes[i].country = this.locations.filter(loc => loc.value === virtualNodes[i].location)[0].country;
      this.virtualNodes.push(virtualNodes[i]);
    }
  }

  constructor(public dialogRef: MdDialogRef<AuctionResultDialogComponent>) {
  }

}
