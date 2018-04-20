import {Component, Inject, Input} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";
import {PeeringNode} from "../../model/PeeringNode";
import {Static_Values} from "../../static_values";


@Component({
  selector: 'virtual-node',
  templateUrl: './peering-node.dialog.component.html',
})
export class PeeringNodeDialogComponent {

  public inputLocation: string;
  public inputPeeringNode: PeeringNode;
  public resourceTypesList: string [] = [];
  typeA: boolean = false;
  typeB: boolean = false;
  typeC: boolean = false;
  typeD: boolean = false;
  typeE: boolean = false;
  typeF: boolean = false;

  public addMode: boolean = false;

  private locations = new Static_Values().locations;

  @Input('inputNode')
  set inputNode(peeringNode: PeeringNode) {
    this.inputPeeringNode = peeringNode;
    this.inputPeeringNode.country = this.locations.filter(loc => loc.value === this.inputPeeringNode.location)[0].country;
    peeringNode.resources.forEach(type => {
      if (type === 'A'){
        this.typeA = true;
      }
      if (type === 'B'){
        this.typeB = true;
      }
      if (type === 'C'){
        this.typeC = true;
      }
      if (type === 'D'){
        this.typeD = true;
      }
      if (type === 'E'){
        this.typeE = true;
      }
      if (type === 'F'){
        this.typeF = true;
      }
    })
  }

  constructor(public dialogRef: MdDialogRef<PeeringNodeDialogComponent>) {
  }

  save(){
    this.dialogRef.close({location: this.inputLocation, resources: this.resourceTypesList});
  }
  isTypeClicked(){
    return (this.typeA || this.typeB || this.typeC || this.typeD || this.typeE || this.typeF)
  }
  typeClicked(type){
    if (type === 'A' && !this.typeA)
      this.resourceTypesList.push(type);

    else if (type === 'B' && !this.typeB)
      this.resourceTypesList.push(type);

    else if (type === 'C' && !this.typeC)
      this.resourceTypesList.push(type);

    else if (type === 'D' && !this.typeD)
      this.resourceTypesList.push(type);

    else if (type === 'E' && !this.typeE)
      this.resourceTypesList.push(type);

    else if (type === 'F' && !this.typeF)
      this.resourceTypesList.push(type);

    else
      this.resourceTypesList = this.resourceTypesList.filter(resType => resType !== type);
  }


  isDisabled(){
    return (!this.inputLocation || this.resourceTypesList.length === 0)
  }
}
