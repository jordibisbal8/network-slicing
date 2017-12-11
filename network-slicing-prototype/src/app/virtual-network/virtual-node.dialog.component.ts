import {Component, Inject} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";


@Component({
  selector: 'virtual-node',
  templateUrl: './virtual-node.dialog.component.html',
})
export class VirtualNodeDialogComponent {

  public address: string;
  public inputResource: string;
  public inputLocation: string;
  public inputComment: string;

  constructor(public dialogRef: MdDialogRef<VirtualNodeDialogComponent>,
              public snackBar: MdSnackBar) {
  }
  save(){
    this.dialogRef.close({resource: this.inputResource, location: this.inputLocation, comment: this.inputComment});
  }
}
