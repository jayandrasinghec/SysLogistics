import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TimerPopupComponent } from '../content/partials/components/timer-popup/timer-popup.component';
import { Messages } from '../common/Messages';
import { ConfirmationPopupComponent } from '../content/partials/components/confirmation-popup/confirmation-popup.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly CUSTOM: string = "custom_popup";
  private readonly POPUP_WIDTH: string = "450px";
  private readonly ALERT: string = "alert";
  private readonly POPUP: string = "popup";

  constructor(private dialog: MatDialog) { }

  // showWarningPopup(_title = Messages.WARNING_TITLE, _message = "Sure?"): MatDialogRef<any> {
  //   return this.dialog.open(ConfirmationPopupComponent,
  //     {
  //       data: {
  //         title: _title,
  //         message: _message,
  //         type: this.POPUP,
  //         disableCancelBtn: false,
  //         disableOkBtn: false
  //       },
  //       panelClass: this.CUSTOM,
  //       autoFocus: true
  //     });
  // }

  showConfirmationPopup(_title = Messages.CONFIRM_TITLE, _message = Messages.SAVE_CHANGES): MatDialogRef<any> {
    return this.dialog.open(ConfirmationPopupComponent,{
      width: this.POPUP_WIDTH, 
      data: { 
        title: _title, 
        message: _message, 
        type: this.POPUP,
        disableCancelBtn: false, 
        disableOkBtn: false,
        cancelButtonName: "No",
        okButtonName:'Yes'
      },
      panelClass: this.CUSTOM
    })
  }

  showInfoPopup(_title, _message): MatDialogRef<any> {
    return this.dialog.open(ConfirmationPopupComponent,{ 
      width: this.POPUP_WIDTH,
      data: { title: _title,
        message: _message,
        type: this.ALERT, disableCancelBtn: false,
        disableOkBtn: false
      },
      disableClose: true,
      backdropClass: 'loader-backfrop',
      panelClass: this.CUSTOM
    });
  }

  showTimerPopup(_title, _message): MatDialogRef<any> {
    return this.dialog.open(TimerPopupComponent,{ 
      width: this.POPUP_WIDTH,
      data: { title: _title,
        message: _message,
        type: this.POPUP, disableCancelBtn: false,
        disableOkBtn: false
      },
      disableClose: true,
      backdropClass: 'loader-backfrop',
      panelClass: this.CUSTOM
    });
  }
}
