import {Component, Inject} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";


@Component({
  selector: 'virtual-node',
  templateUrl: './virtual-node.dialog.component.html',
})
export class VirtualNodeDialogComponent {

  public inputResource: string;
  public inputLocation: string;
  //public inputComment: string;
  public inputNode;

  public editMode: boolean = false;

  constructor(public dialogRef: MdDialogRef<VirtualNodeDialogComponent>,
              public snackBar: MdSnackBar) {
  }
  save(){
    if (!this.editMode)
      this.dialogRef.close({resource: this.inputResource, location: this.inputLocation});
    else this.dialogRef.close(this.inputNode);
  }
}
