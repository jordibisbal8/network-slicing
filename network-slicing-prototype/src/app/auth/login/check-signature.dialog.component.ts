import {Component} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";
import {AuthService} from "../auth.service";
const cuid = require('cuid'); //random string


@Component({
  selector: 'check-signature',
  templateUrl: './check-signature.dialog.component.html',
})
export class CheckSignatureDialogComponent {

  public address: string;
  public message: string = cuid();

  constructor(public dialogRef: MdDialogRef<CheckSignatureDialogComponent>,
              public snackBar: MdSnackBar,
              private authService: AuthService) {
  }
  checkSig(){
    //this.authService.authenticate(this.address, this.message);
    this.dialogRef.close();
    this.snackBar.open("User successfully authenticate, you are now logged in", 'X', {
      duration:5000
    });
  }
}
