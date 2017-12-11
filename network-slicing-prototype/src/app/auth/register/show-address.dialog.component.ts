import {Component} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";


@Component({
  selector: 'show-address',
  templateUrl: './show-address.dialog.component.html',
})
export class ShowAddressDialogComponent {

  public address: string;

  constructor(public dialogRef: MdDialogRef<ShowAddressDialogComponent>,
              public snackBar: MdSnackBar) {
  }
  showCopied(){
    this.snackBar.open("Ethereum account copied. Please store it", 'X', {
      duration:5000
    });
    this.dialogRef.close();
  }
  close(){
    let result = confirm('Have you already copied your Ethereum account in your PC?');
    if (result) {
      this.dialogRef.close();
    }
  }
}
