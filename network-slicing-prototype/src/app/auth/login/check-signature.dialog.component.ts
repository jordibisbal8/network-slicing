import {Component} from "@angular/core";
import {MdDialogRef, MdSnackBar} from "@angular/material";
import {AuthService} from "../auth.service";
const cuid = require('cuid'); //random string
var randomWords = require('random-words');


@Component({
  selector: 'check-signature',
  templateUrl: './check-signature.dialog.component.html',
})
export class CheckSignatureDialogComponent {

  public address: string;
  public message: string = randomWords({ min: 5, max:10, join: ' ' });


  constructor(public dialogRef: MdDialogRef<CheckSignatureDialogComponent>) {
  }
}
