import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation, ViewChildren, QueryList, ChangeDetectorRef} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {ValidateService} from '../../../../../services/validate.service';
import { Subscription } from 'rxjs/internal/Subscription';
import {InputTextComponent} from '../../../../partials/components/inputtext/inputtext.component';
import {CustomerNotificationService} from '../../../../../services/customerNotification.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { CustomerNotificationModel } from '../../../../../core/models/customernotification.model';
import AuthService from 'src/app/services/auth.service';
import { ApplicationService } from 'src/app/services/application.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-customer-notification',
  templateUrl: './customernotification.html',
  styleUrls: ['./customernotification.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerNotificationComponent implements OnInit, OnDestroy {

    private isValid:Boolean;
    private validateSubscription: Subscription;
    private routerSubscription: Subscription;
    model: CustomerNotificationModel;
    notifications: any;
    generalNotifications: any ;
    bookingAgentNotification: any;
    pickupReminderNotification: any;
    customerNotification: any;
    customerNotificationInitialResponse: any;
    private authService: any;
    isEditMode:boolean;
    isEditUrl:boolean;
    isNotifyCustomer:boolean;

    is_Editable_NotifyCustomer:boolean = true;
    is_Editable_NotificationCode:boolean = true;
    is_Editable_InvoiceFlag:boolean = true;
    is_Editable_PickupReminder:boolean = true;     
    is_Editable_NotifyBookingAgent:boolean = true;

    @ViewChildren(InputTextComponent) inputTextChildren :QueryList<InputTextComponent>;
  constructor(private validateService: ValidateService,
              private customerNotificationService: CustomerNotificationService,
              private localStorageService: LocalStorageService,
              private activatedRoute: ActivatedRoute,
              private router : Router,
              private dialogService : DialogService,
              private cdRef : ChangeDetectorRef,
              private rulesService:BusinessRulesService) {
    ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('orderId');
    this.model = new CustomerNotificationModel();
    this.model.bookingId = activatedRoute.snapshot.paramMap.get('id') || localStorageService.getItem(`${ApplicationService.instance.order_id}:view_booking_id`);
    ApplicationService.instance.booking_id = this.model.bookingId;
    this.authService = AuthService.getInstance();
   /* if(this.authService.hasToken)
    {
      this.fetchDataLoad()
    }else{
      this.router.navigateByUrl("login");
    }*/
    this.routerSubscription = this.router.events.subscribe((event)=>{this.init(event)});
}
init(event){
  if(event instanceof NavigationEnd){
    this.isEditMode = (event.url.indexOf('view-booking')!== -1)?false:true;
    this.isEditUrl = (event.url.indexOf('edit-booking')!== -1)?true:false;
    if (this.authService.hasToken) {
      this.fetchDataLoad();
    } else {
      this.router.navigateByUrl("login");
    }
  }
}
ngOnInit(): void {
  // setTimeout(() => {
  // this.localStorageService.getData('booking_id').subscribe((result) => {
  //   this.model.bookingId = result;
  //     this.getCustomerNotificationData();

  //   });
  // },1000);
  this.validateSubscription = this.validateService.validateComponentEvent$.subscribe(event => this.validateChildComponent(event));
  this.is_Editable_NotifyCustomer = this.isEditable('notifyCustomer');
  this.is_Editable_NotificationCode = this.isEditable('notificationCode');
  this.is_Editable_InvoiceFlag = this.isEditable('invoiceFlag');
  this.is_Editable_PickupReminder = this.isEditable('pickupReminder');   
  this.is_Editable_NotifyBookingAgent = this.isEditable('notifyBookingAgent');


}
ngOnDestroy(): void {
  this.validateSubscription.unsubscribe();
  this.validateSubscription =null;
  this.routerSubscription.unsubscribe();
  this.routerSubscription =null;
}

fetchDataLoad() {
  const notificationType = (this.isEditUrl) ? 'editCustomernotification' : 'customernotification';
  this.localStorageService.getData(`${this.model.bookingId}:${notificationType}`).subscribe((result)=>
  {
    if(result && result !== 'undefined') {
      let localData = JSON.parse(result);
      this.customerNotificationInitialResponse = localData.customerNotificationInitialResponse;
      this.model =  localData.modelData || this.model;
      this.isNotifyCustomer = this.model.notifyCustomer;      
      const orderType = (this.isEditUrl) ? 'editBookingOrder' : 'bookingOrder';
      this.model.pickupReminderEmail = (this.model.pickupReminderEmail && this.model.pickupReminderEmail.trim() != '') ? this.model.pickupReminderEmail
                                     : JSON.parse(this.localStorageService.getItem(`${this.model.bookingId}:${orderType}`)).shipper_Email;      
      this.notifications = this.customerNotificationInitialResponse.notifications;      
      this.filterData();

    }else{
      this.customerNotificationService.getCustomerNotificationData(this.model.bookingId).subscribe((response: any) => {
        if(response){
          this.customerNotificationInitialResponse = response;
          this.model =  response.customerNotification || this.model;
          this.isNotifyCustomer = this.model.notifyCustomer;          
          const orderType = (this.isEditUrl) ? 'editBookingOrder' : 'bookingOrder';
          this.model.pickupReminderEmail = (this.model.pickupReminderEmail && this.model.pickupReminderEmail.trim() != '') ? this.model.pickupReminderEmail
                                         : JSON.parse(this.localStorageService.getItem(`${this.model.bookingId}:${orderType}`)).shipper_Email;
                                        
          this.notifications = response.notifications;
          this.filterData();
        }
      })
    }

   })

}

filterData(){
  this.generalNotifications = [];
  this.bookingAgentNotification = [];
  this.pickupReminderNotification = [];
  this.customerNotification = [];
  for(let notification of this.notifications){

    if(notification.type === 'General')
    {
      this.generalNotifications.push(notification);
    }
    else if(notification.type === 'BookingAgent')
    {
      this.bookingAgentNotification.push(notification)
    }
    else if(notification.type === 'PickupReminder')
    {
      this.pickupReminderNotification.push(notification)
    }
    else if(notification.type === 'Customer')
    {
      this.customerNotification.push(notification)
    }
 }
 this.generalNotifications.sort( c=> c.displayOrder);
 this.bookingAgentNotification.sort( c=> c.displayOrder);
 this.pickupReminderNotification.sort( c=> c.displayOrder);
 this.customerNotification.sort( c=> c.displayOrder);
}

showAlertMesage(data: any){
  const dialogRef = this.dialogService.showInfoPopup(data.title,data.message);
}

validateInputElement(){
  this.isValid = true;
    if(this.inputTextChildren){
        for(let inputText of this.inputTextChildren.toArray())
        {
          if(!inputText.validateInputElement())
          {
            this.isValid = false;
          }          
        }
    }
    return this.isValid;
  }

  validateChildComponent(event){
    if(event && event.tabIndex == 2){
      if(event.type == 'prev' || event.newIndex == 0 || event.newIndex == 1 ){
        this.localStorageService.saveData(`${this.model.bookingId}:customernotification`,
                              JSON.stringify({customerNotificationInitialResponse : this.customerNotificationInitialResponse, modelData : this.model}));
        event.isValid = true;
        this.validateService.validateCompleted(event);
      }
      else if(this.model.notifyCustomer){
          if((!this.model.attention || this.model.attention == '') || (!this.model.email || this.model.email == '') ||
              (!this.model.notificationCode || this.model.notificationCode == '')) 
              {
                 const msg:any = {title: 'Validation Error', message: `Please fill up Attention, Client Email 
                                                                        and select one of the notification type radio button.` };
                  this.showAlertMesage(msg);
                  return;
              }
              else if (!this.validateService.validateEmailFormat(this.model, "email")){
                  const msg:any = {title: 'Validation Error', message: `Client email format is not valid. 
                                                                        Please correct the client email format.` };
                  this.showAlertMesage(msg);
                  return;
              }
              this.saveCustomerNotificationAndNavigate(event);
      }
      else{
        this.saveCustomerNotificationAndNavigate(event);
      }
    }
  }

  validatePickupReminderEmail(){
    if(!this.validateService.validatePickupReminderEmail(this.model)){
            const msg:any = {title: 'Validation Error', message: `Pickup reminder email(s) format is not valid. 
                                                                    Please correct the pickup reminder email(s) format.` };
            this.showAlertMesage(msg);
            return false;
        }
        return true;
  }

  saveCustomerNotificationAndNavigate(event){
    if(!this.validatePickupReminderEmail())
    {
      return;
    }
    this.model.userId = this.authService.userId;
    if(this.isEditUrl) { // if Edit Mode
        this.saveEditDatainLocalStorage();
        event.isValid = true;
        this.validateService.validateCompleted(event);
        return ;
    }
    let replicateModel : any = this.model;
    replicateModel.pickupReminderEmail = replicateModel.pickupReminder ? replicateModel.pickupReminderEmail : "";
    if(!this.model.customerNotificationConfigId || this.model.customerNotificationConfigId == 0){
                //if(this.haveRequiredValues()){              
              this.customerNotificationService.createCustomerNotification(replicateModel).subscribe( response => {
                if(response.error){
                  alert('Error- create customer/notifications');
                  return;
                }
                if(event.type=="next"){
                  this.localStorageService.saveTabStausData(`${response.bookingId}:tabstatus`, [false,false,false,false])
                }
                this.localStorageService.saveData(`${this.model.bookingId}:customernotification`,
                JSON.stringify({customerNotificationInitialResponse : this.customerNotificationInitialResponse, modelData : response}));
                event.isValid = true;
                this.validateService.validateCompleted(event);
            });
          // }else{
          //   this.localStorageService.saveData(`${this.model.bookingId}:customernotification`,
          //   JSON.stringify({customerNotificationInitialResponse : this.customerNotificationInitialResponse, modelData : this.model}));
          //   event.isValid = true;
          //   this.validateService.validateCompleted(event);
          // }
    } else {
      //if(this.haveRequiredValues()){
            this.customerNotificationService.updateCustomerNotification(replicateModel).subscribe( response => {
              if(response.error){
                alert('Error- update customer/notifications');
                return;
              }
              if(event.type=="next"){
                this.localStorageService.saveTabStausData(`${response.bookingId}:tabstatus`, [false,false,false,false])
              }
              this.localStorageService.saveData(`${this.model.bookingId}:customernotification`,
              JSON.stringify({customerNotificationInitialResponse : this.customerNotificationInitialResponse, modelData : response}));
              event.isValid = true;
              this.validateService.validateCompleted(event);
            });
        // }
        // else{
        //   this.localStorageService.saveData(`${this.model.bookingId}:customernotification`,
        //   JSON.stringify({customerNotificationInitialResponse : this.customerNotificationInitialResponse, modelData : this.model}));
        //   event.isValid = true;
        //   this.validateService.validateCompleted(event);
        // }
    }
  }

haveRequiredValues(){
   return ( Object.keys(this.model).length > 3
    && this.model.attention
    && this.model.email
    && this.model.attention != ""
    && this.model.email != ""
    )
}

handleRadioClick(notifyCode) {
  this.model.notificationCode = (this.model.notificationCode === notifyCode) ? '' : notifyCode;
  if (this.isEditUrl) {
    this.saveEditDatainLocalStorage();
  }
}

saveEditDatainLocalStorage(){
  this.localStorageService.saveData(`${this.model.bookingId}:editCustomernotification`,
  JSON.stringify({customerNotificationInitialResponse : this.customerNotificationInitialResponse, modelData : this.model}));
}

modelChange(event, key) {
this.model[key] = event;
if (this.isEditUrl) {
  this.saveEditDatainLocalStorage();
}

}
checkBoxChange(event) {
  if (this.isEditUrl) {
    this.saveEditDatainLocalStorage();
  }
  
}

notifyAgentCheckBoxChange(event, notifyCustomerService) {
  if(notifyCustomerService)
  {
    this.model.bookingAgentEmail = JSON.parse(this.localStorageService.getItem('user')).email;
  }
  else{
    this.model.bookingAgentEmail = '';
  }

  if (this.isEditUrl) {
    this.saveEditDatainLocalStorage();
  }
}

notifyCustomerCheckBoxChange(event, notifyCustomer) {
  if(!notifyCustomer){
    if((this.model.attention && this.model.attention != '') || (this.model.email && this.model.email != '')
         || ( this.model.notificationCode && this.model.notificationCode != ''))
    {
      this.cdRef.detectChanges();
      this.model.notifyCustomer = true;
      const msg:any = {title: 'Warning', message: `Please remove Attention, Client Email and Notification Type and then unselect Send Confirmation.` };
      this.showAlertMesage(msg);
      return;
    }
    else{
      this.isNotifyCustomer = notifyCustomer
    } 
  }
  else{
    this.isNotifyCustomer = notifyCustomer
  } 
  
}

private isEditable(fieldName) {
      if(this.isEditUrl && this.isEditMode) {          
         return this.rulesService.shouldEditable(fieldName);
       }
      return this.isEditMode;
}

}
