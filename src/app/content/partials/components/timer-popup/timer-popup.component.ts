import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-timer-popup',
  templateUrl: './timer-popup.component.html',
  styleUrls: ['./timer-popup.component.scss']
})
export class TimerPopupComponent implements OnInit {
  count:any;
  constructor(public dialogRef: MatDialogRef<TimerPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    data.cancelButtonName = data.cancelButtonName ? data.cancelButtonName : "Cancel";

  }

  ngOnInit() {
  }
  cancelClickHandle(event) {
   // this.dialogRef.close();
   this.dialogRef.close({ clickedCancel: true });
  }


}
