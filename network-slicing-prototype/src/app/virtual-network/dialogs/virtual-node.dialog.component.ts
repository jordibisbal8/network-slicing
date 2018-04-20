import {Component, Inject, Input} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";
import {VirtualNode} from "../../model/VirtualNode";
import {Static_Values} from "../../static_values";


@Component({
  selector: 'virtual-node',
  templateUrl: './virtual-node.dialog.component.html',
})
export class VirtualNodeDialogComponent {

  public inputType: string;
  public inputLocation: string;
  public inputUpperBoundCost: number;
  public isUpperBoundMandatory: boolean = false;

  @Input('inputNode')
  set inputNode(virtualNode: VirtualNode) {
    this.virtualNode = virtualNode;
    this.virtualNode.country = this.locations.filter(loc => loc.value === this.virtualNode.location)[0].country;
  }

  public virtualNode;

  public addMode: boolean = false;
  public biddingMode: boolean = false;

  private locations = new Static_Values().locations;

  constructor(public dialogRef: MdDialogRef<VirtualNodeDialogComponent>) {
  }
  save(){
      return this.dialogRef.close({type: this.inputType, location: this.inputLocation, upperBoundCost: this.inputUpperBoundCost});
  }

  saveBid() {
    return this.dialogRef.close(this.virtualNode.bid);
  }
  isDisabled() {
    if (this.isUpperBoundMandatory)
      return (!this.inputUpperBoundCost || !this.inputType || !this.inputLocation);
    return (!this.inputType || !this.inputLocation);
  }

  isBigger() {
    if (this.virtualNode.bid > this.virtualNode.upperBoundCost) {
      alert('You bid value must be smaller than the upper bound cost');
      this.virtualNode.bid = null;
    }
  }
}
