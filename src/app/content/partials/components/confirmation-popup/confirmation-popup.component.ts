import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss'],
})
export class ConfirmationPopupComponent implements OnInit {


  constructor(public dialogRef: MatDialogRef<ConfirmationPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    data.okButtonName = data.okButtonName ? data.okButtonName : "Ok";
     data.cancelButtonName = data.cancelButtonName ? data.cancelButtonName : "Cancel";
  }

  ngOnInit() {
  }

  cancelClickHandle(event) {
    this.dialogRef.close({ clickedCancel: true });
  }

  okClickHandle(event) {
    this.dialogRef.close({ clickedOkay: true });
  }

}
