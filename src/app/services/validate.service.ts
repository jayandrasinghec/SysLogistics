import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn:"root"})
export class ValidateService{

    //currentBookingId:any;
    //tabValidation:any = [false, false, false, false];
    private mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    constructor(){

    }

    private validateComponentEvent = new BehaviorSubject({});
    validateComponentEvent$ = this.validateComponentEvent.asObservable();
    validateComponent(event: any) {
        //this.tabValidation[event.tabIndex] = event.isValid
        this.validateComponentEvent.next(event);
    }

    private validateCompleteEvent = new BehaviorSubject({});
    validateCompleteEvent$ = this.validateCompleteEvent.asObservable();
    validateCompleted(message: any) {
        this.validateCompleteEvent.next(message);
    }

    reset() {
        this.validateComponentEvent.next(null);
        this.validateCompleteEvent.next(null);
    }

    
    public isValidCustomerNotificationData(model:any) {
        const arrValidKeys: Array<string> = ['attention', 'email', 'notificationCode'];
        if(model['notifyCustomer']){
            for (let item of arrValidKeys) {
            const value = model[item];
            if (value === null || value === undefined || value.trim() === '') {
                return false   ;
            }
            }
        }
        return true;
    }

    public validatePickupReminderEmail(model:any){
        let pickupReminderEmails = model['pickupReminderEmail'];
        if(model['pickupReminder'] && pickupReminderEmails && pickupReminderEmails.trim() != ""){
          let emails = pickupReminderEmails.split(',');
          for(let email of emails)
          {
              email = email.trim();
             if (!email.match(this.mailformat)){               
                return false;
            }
          }
        }
        return true;
      }

    public validateEmailFormat(model:any, emailFieldName: any){
        let email = model[emailFieldName];
        //email = email ? email.trim() : "";
        if (email && !email.trim().match(this.mailformat)){               
            return false;           
        }
        return true;
      }


}
