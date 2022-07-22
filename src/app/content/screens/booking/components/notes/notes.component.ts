import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { ValidateService } from 'src/app/services/validate.service';
import { ApplicationService } from 'src/app/services/application.service';
import AuthService from 'src/app/services/auth.service';
import { NotesModel } from 'src/app/core/models/notes.model';
import { NotesService } from 'src/app/services/notes.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { BookingService } from 'src/app/services/booking.service';
//import { BillToModel } from 'src/app/core/models/billto.model';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { BillToService } from 'src/app/services/billto.service';
import { CustomerNotificationService } from 'src/app/services/customerNotification.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class NotesComponent implements OnInit, OnDestroy {

  model:any;
  validateSubscription:any;
  routerSubscription:Subscription;
  validateAndSaveSubscription:any;
  internalNotes:any;
  invoiceNotes:any;
  folderNotes:any;
  authService:any;
  initialNotesData:any;
  bookingOrderModel : BookingOrder;
  isEditMode:boolean = true;
  isEditUrl:boolean = false;
  orderResponse: any;
  constructor(private validateService: ValidateService,
    private activatedRoute: ActivatedRoute,
    private notesService: NotesService,
    private utilsService : UtilsService,
    private bookingService : BookingService,
    private billToService: BillToService,
    private router : Router,
    private localStorageServive:LocalStorageService,
    private dialogService : DialogService,
    private customerNotificationService: CustomerNotificationService) {
        ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('orderId');
        this.model = new NotesModel();
        this.bookingOrderModel = new BookingOrder();
        this.model.booking_ID = activatedRoute.snapshot.paramMap.get('id') || localStorageServive.getItem(`${ApplicationService.instance.order_id}:view_booking_id`);
        //this.model.order_ID = localStorageServive.getItem('view_order_id');
        ApplicationService.instance.booking_id = this.model.booking_ID;
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
        this.isEditUrl = (event.url.indexOf('edit-booking') !== -1) ? true : false;
        if (this.authService.hasToken) {
          this.fetchDataLoad();
        } else {
          this.router.navigateByUrl("login");
        }
      }
    }

ngOnInit(): void {
this.validateSubscription = this.validateService.validateComponentEvent$.subscribe(event => this.validateChildComponent(event));
}
ngOnDestroy(): void {
this.validateSubscription.unsubscribe();
this.validateSubscription=null;
this.routerSubscription.unsubscribe();
this.routerSubscription =null;
}

fetchDataLoad() {
  const notesType = (this.isEditUrl) ? 'editNotes' : 'notes';
  this.localStorageServive.getData(`${this.model.booking_ID}:${notesType}`).subscribe((result) => {
    if(result){
      let localData = JSON.parse(result);
      this.initialNotesData = localData.initialNotesData;
      this.model = localData.modelData || this.model;
      this.filterNotes();
    }
    else{
        this.notesService.getNotesData(this.model.booking_ID).subscribe((response: any) => {
          if(response.error){
            alert("Error- order/notes/search");
            return;
          }
          if(response){
            this.initialNotesData = response
            this.filterNotes();
          }
        });
      }
  });


}

filterNotes(){
  this.internalNotes = [];
  this.folderNotes = [];
  this.invoiceNotes = [];
  for(let note of this.initialNotesData){

    if(note.hasOwnProperty('internal_Notes') && note.internal_Notes)
    {
      this.internalNotes.push(
        {
          date:note.created_Date,
          userId:note.created_By,
          noteText:note.internal_Notes,
        }
      );
    }
    if(note.hasOwnProperty('invoice_Notes') &&  note.invoice_Notes)
    {
      this.invoiceNotes.push(
        {
          date:note.created_Date,
          userId:note.created_By,
          noteText:note.invoice_Notes,
        }
      );
    }
    if(note.hasOwnProperty('folder_Notes') &&   note.folder_Notes)
    {
      this.folderNotes.push(
        {
          date:note.created_Date,
          userId:note.created_By,
          noteText:note.folder_Notes,
        }
      );
    }
  }
  this.internalNotes.reverse(i => i.created_Date);
  this.folderNotes.reverse(i => i.created_Date);
  this.invoiceNotes.reverse(i => i.created_Date);
}

validateChildComponent(event){
if(event && event.type == 'save'){
  event.type == '';
  const dialogRef = this.dialogService.showConfirmationPopup(Messages.SAVE_ORDER_TITLE,Messages.CONFIRM_SAVE_ORDER);

  dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
      this.validateAndSaveOrder(event);
      //this.validateService.validateCompleted({order:'saved'});
    }
  });
}
if(event && event.tabIndex == 3){
  const notesType = (this.isEditUrl) ? 'editNotes' : 'notes';
  this.localStorageServive.saveData(`${this.model.booking_ID}:${notesType}`, JSON.stringify({initialNotesData : this.initialNotesData,  modelData : this.model}));
  event.isValid = true;
  this.validateService.validateCompleted(event);
}
}

validateAndSaveOrder(event){
  if (this.isEditUrl) { //if Edit
    this.saveEditBookingOrderData();
    return;
  }

  
  // Validate mandatory fields in case of fresh booking
  let bookingOrderModel = this.localStorageServive.getItem(`${this.model.booking_ID}:bookingOrder`);
  bookingOrderModel = JSON.parse(bookingOrderModel);   
  if (!this.utilsService.isOrderDataValid(bookingOrderModel)) {
    const msg:any = {title: 'Validation Error', message: `Mandatory fields are not valid. Please fill up all the mandatory fields.` };
    this.showAlertMesage(msg);
    return;
  }

  let customernotification = this.localStorageServive.getItem(`${this.model.booking_ID}:customernotification`);
  customernotification = JSON.parse(customernotification);  
  if (customernotification && !this.validateService.isValidCustomerNotificationData(customernotification['modelData'])) {
    const msg:any = {title: 'Validation Error', 
          message: `Customer Notification mandatory fields are not valid. Please fill up all the mandatory fields 
                      OR select one of the notification type radio button.` };
    this.showAlertMesage(msg);
    return;
  }
  else if (customernotification && !this.validateService.validateEmailFormat(customernotification['modelData'], "email")) {
    const msg:any = {title: 'Validation Error', 
          message: `Customer Notification client email format is not valid. 
          Please correct the client email format.` };
    this.showAlertMesage(msg);
    return;
  }
  else if (customernotification && !this.validateService.validatePickupReminderEmail(customernotification['modelData'])) {
    const msg:any = {title: 'Validation Error', 
          message: `Customer Notification pickup reminder email(s) format is not valid. 
                                      Please correct the pickup reminder email(s) format.` };
    this.showAlertMesage(msg);
    return;
  }

  if (this.model.internal_Notes || this.model.folder_Notes  || this.model.invoice_Notes )
  {
        this.model.created_By = this.authService.userId;
        this.notesService.createNotes(this.model, this.model.booking_ID).subscribe( response => {
            if(response.error){
              alert('Error- create order/notes/search');
              return;
            }else{
              this.localStorageServive.clear(`${this.model.booking_ID}:notes`);
              this.clearNotesData();
              this.localStorageServive.getData(`${this.model.booking_ID}:bookingOrder`).subscribe((result) => {
                if(result){
                  this.bookingOrderModel = JSON.parse(result);
                  this.saveOrder();
                }else{
                  this.fetchDataLoad();
                  this.validateService.validateCompleted({order:'saved'});
                        return;
                }
              })

            }
        });
  }else{
        this.localStorageServive.getData(`${this.model.booking_ID}:bookingOrder`).subscribe((result) => {
          if(result){
          this.bookingOrderModel = JSON.parse(result);
          this.saveOrder();
        }
        else{
          this.validateService.validateCompleted({order:'saved'});
          return;
        }
      })
  }
}

saveOrder(){
  this.bookingOrderModel.created_By = this.authService.userId;
  this.bookingService.saveBooking(this.bookingOrderModel.order_ID ? false : true, this.bookingOrderModel).subscribe((response) => {
    if(response.error){
      // this.confirmDialogTitle = 'Error';
      // this.confirmDialogTitle = `Server Error : ${response.message}`
      // alert(`Server Error : ${response.message}`);
      const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,`Server Error : ${response.message}`);
      return;
    }
    else{
      //this.localStorageServive.clear(`${this.model.booking_ID}:odf`);
      this.localStorageServive.clearBookingData(this.model.booking_ID);
      ApplicationService.instance.order_id = response.order_ID;
      this.localStorageServive.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response));
      this.localStorageServive.saveData(`${response.order_ID}:order`, JSON.stringify(response));
      this.fetchDataLoad();
      this.validateService.validateCompleted({order:'saved'});

      return;
    }
  })
}

clearNotesData(){
  this.model.internal_Notes = "";
  this.model.folder_Notes = "";
  this.model.invoice_Notes = "";
}

internalNotesChangehandler(event){
    this.model.internal_Notes = event;
    this.saveEditedNotesinCache();
}
folderNotesChangehandler(event){
    this.model.folder_Notes = event;
    this.saveEditedNotesinCache();
}
invoiceNotesChangehandler(event){
    this.model.invoice_Notes = event;
    this.saveEditedNotesinCache();
}
showAlertMesage(data: any){
  const dialogRef = this.dialogService.showInfoPopup(data.title,data.message);
}
/* Record has been changed by another user then this popup will show  */
showWarning(data: any){
    const dialogRef = this.dialogService.showConfirmationPopup(data.title,data.message);
    dialogRef.afterClosed().subscribe((response) => {
        if (response && response.clickedOkay) {
           /* If clicked  OK reload the Order data */
          this.reloadOrderData();
        } else if (response && response.clickedCancel) {
          /* If clicked cancel clear the local storage and goto Dashboard */
          this.localStorageServive.clear(`${this.model.booking_ID}:editNotes`);
          this.localStorageServive.clear(`${this.model.tariff_ID}:serviceLevels`);
          this.localStorageServive.clearBookingData(this.model.booking_ID);
          this.router.navigateByUrl('dashboard');
        }
    });
}
/*  First SaveOrder
      Save Special order
      Save Customer notification
      Save notes
  */
saveEditBookingOrderData() {
  let editBookingOrderData = this.localStorageServive.getItem(`${this.model.booking_ID}:editBookingOrder`);
  editBookingOrderData = JSON.parse(editBookingOrderData);
  let editSpecialAccountData = this.localStorageServive.getItem(`${this.model.booking_ID}:editSpecialAccount`);
  let cutomerType = this.localStorageServive.getItem(`${this.model.booking_ID}:customer_Type`);
  if (!this.utilsService.isOrderDataValid(editBookingOrderData)) {
    const msg:any = {title: 'Validation Error', message: `Mandatory fields are not valid. Please fill up all the mandatory fields.` };
    this.showAlertMesage(msg);
    return;
  }
  if (cutomerType === 'Intel' && editSpecialAccountData && editSpecialAccountData !== 'delete') {
    editSpecialAccountData = JSON.parse(editSpecialAccountData);
    if (!this.utilsService.isValidSpecialAccountData(editSpecialAccountData)) {
      const msg:any = {title: 'Validation Error', message: `Mandatory fields are not valid. Please fill up all the mandatory fields.` };
      this.showAlertMesage(msg);
      return;
    }
  }
  let editCustomernotification = this.localStorageServive.getItem(`${this.model.booking_ID}:editCustomernotification`);
  editCustomernotification = JSON.parse(editCustomernotification);  
  if (editCustomernotification && !this.validateService.isValidCustomerNotificationData(editCustomernotification['modelData'])) {
    const msg:any = {title: 'Validation Error', 
          message: `Customer Notification mandatory fields are not valid. Please fill up all the mandatory fields 
                      OR select one of the notification type radio button.` };
    this.showAlertMesage(msg);
    return;
  }  
  else if (editCustomernotification && !this.validateService.validateEmailFormat(editCustomernotification['modelData'], "email")) {
    const msg:any = {title: 'Validation Error', 
          message: `Customer Notification client email format is not valid. 
          Please correct the client email format.` };
    this.showAlertMesage(msg);
    return;
  }
  else if (editCustomernotification && !this.validateService.validatePickupReminderEmail(editCustomernotification['modelData'])) {
    const msg:any = {title: 'Validation Error', 
          message: `Customer Notification pickup reminder email(s) format is not valid. 
                                      Please correct the pickup reminder email(s) format.` };
    this.showAlertMesage(msg);
    return;
  }

  let bookingData: any = this.localStorageServive.getItem(`${this.model.booking_ID}:bookingOrder`);
  bookingData = JSON.parse(bookingData);
  this.bookingService.getOrderData(ApplicationService.instance.order_id).subscribe((orderData: any) => {
      /* Here it is checking that this order has any change in DB then reload the saved data */
      if (orderData.current_Editing_By !== bookingData.current_Editing_By ||
        orderData.current_Editing_Date !== bookingData.current_Editing_Date ) {
        const msg: any = {title: 'Alert',
         message: `Record has been changed by another user, ${orderData.current_Editing_By}. Do you want to load the current record?` };
        this.showWarning(msg);
        return;
      }


      this.localStorageServive.getData(`${this.model.booking_ID}:editBookingOrder`).subscribe((result) => {
        if (result) {
          this.bookingOrderModel = JSON.parse(result);
          this.bookingOrderModel.created_By = this.authService.userId;
          this.bookingService.saveBooking(this.bookingOrderModel.order_ID ? false : true, this.bookingOrderModel).subscribe((response) => {
            if (response.error) {
              const msg:any = {title: 'Error', message: `Server Error : ${response.message}` };
              this.showAlertMesage(msg);
              return;
            } else {
              // this.localStorageServive.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response));
              // this.localStorageServive.saveData(`${response.order_ID}:order`, JSON.stringify(response));
              this.orderResponse = response;
              ApplicationService.instance.order_id = response.order_ID;
              this.saveEditSpecailAccount();
            }
          });
        }
      });
  });


}
reloadOrderData() {
  this.localStorageServive.clear(`${this.model.booking_ID}:editCustomernotification`);
  this.localStorageServive.clear(`${this.model.booking_ID}:editNotes`);
  this.localStorageServive.clear(`${this.model.booking_ID}:editSpecialAccount`);
  this.localStorageServive.clear(`${this.model.booking_ID}:editBookingOrder`);

  this.bookingService.getOrderData(ApplicationService.instance.order_id).subscribe((response: any) => {
    if (response.error) {
      const msg:any = {title: 'Error', message: `Server Error : ${response.message}` };
      this.showAlertMesage(msg);
      return;
    }
   // this.localStorageServive.clear(`${this.model.booking_ID}:ksmCategories`);
   // this.localStorageServive.clear(`${this.model.tariff_ID}:serviceLevels`);
    this.localStorageServive.clear(`${this.model.booking_ID}:shipperAirportCodes`);
  //  this.localStorageServive.clear(`${this.model.booking_ID}:showCodes`);
  //  this.localStorageServive.clear(`${this.model.booking_ID}:timeCodes`);
    this.localStorageServive.clear(`${this.model.booking_ID}:consigneeAirportCodes`);

    this.localStorageServive.saveData(`${this.model.order_ID}:order`, JSON.stringify(response));
    this.localStorageServive.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response));
    this.localStorageServive.saveData(`${this.model.booking_ID}:editBookingOrder`, JSON.stringify(response));
    this.localStorageServive.saveData(`${this.model.booking_ID}:view_booking_id`, response.booking_ID);
    this.localStorageServive.saveData(`${this.model.booking_ID}:view_order_id`, response.order_ID);
    this.localStorageServive.saveData(`${this.model.booking_ID}:tariff_ID`, response.tariff_ID);
    this.localStorageServive.saveData(`${this.model.booking_ID}:customer_Code`, response.customer_Code);
    this.localStorageServive.saveData(`${this.model.booking_ID}:pieces`, response.pieces);


    this.router.navigateByUrl(`edit-booking/origin-destination-freight/${ApplicationService.instance.order_id}`);
  });
}
saveEditSpecailAccount() {
       /* Special Acccount */
       let specialAccountData: any = this.localStorageServive.getItem(`${this.model.booking_ID}:editSpecialAccount`);
       this.billToService.getSpecialAccount(this.model.booking_ID).subscribe((res: any) => {
         if (res && res !== null) { // In the Case of Update special Account
            if (specialAccountData) {
                if (specialAccountData !== 'delete' && JSON.parse(specialAccountData).customerCode ) {
                  specialAccountData = JSON.parse(specialAccountData);
                  this.bookingService.updateSpecialAccount(specialAccountData.bookingID, specialAccountData).subscribe((result: any) => {
                    if (res && res.error){
                        alert('Error- update specialaccounts/billing');
                        return;
                    }
                    this.saveEditCustomerNotification();
                  });
                } else if (specialAccountData === 'delete'){
                  this.billToService.deleteSpecialAccount(this.model.booking_ID).subscribe((result:any)=> {
                    if (res && res.error){
                      alert('Error- delete specialaccounts/billing');
                      return;
                    }
                    this.saveEditCustomerNotification();
                  });
                }
            } else {
              this.saveEditCustomerNotification();
            }
         } else {
          if (specialAccountData && specialAccountData !== 'delete' && JSON.parse(specialAccountData).customerCode ) {
            specialAccountData = JSON.parse(specialAccountData);
            this.bookingService.createSpecialAccount(specialAccountData).subscribe((delResponse) => {
              if (res && res.error) {
                alert('Error- create specialaccounts/billing');
                return;
              }
              this.saveEditCustomerNotification();
             });
          } else {
            this.saveEditCustomerNotification();
          }
         }
      });
}
isValidCNData(objModel: any){
  return ( Object.keys(objModel).length > 3
   && objModel.attention
   && objModel.email
   && objModel.attention != ""
   && objModel.email != ""
   );
}
saveEditCustomerNotification() {
  this.localStorageServive.getData(`${this.model.booking_ID}:editCustomernotification`).subscribe((response) => {
    if(response && response !== 'undefined') {
      const localData = JSON.parse(response);
      let CNmodel =  localData.modelData;
      CNmodel.pickupReminderEmail = CNmodel.pickupReminder ? CNmodel.pickupReminderEmail : "";
      if (!CNmodel.customerNotificationConfigId || CNmodel.customerNotificationConfigId === 0) {
          //if (this.isValidCNData(CNmodel)) {
              this.customerNotificationService.createCustomerNotification(CNmodel).subscribe(cnData => {
                  if (cnData.error) {
                    alert('Error- create customer/notifications');
                    return;
                  }
                  this.localStorageServive.saveData(`${this.model.booking_ID}:customernotification`,                  
                  JSON.stringify({customerNotificationInitialResponse : localData.customerNotificationInitialResponse, modelData : cnData}));                  
                  this.saveEditNotes();
              });
          // } else {
          //   this.saveEditNotes();
          // }
      } else {
        this.customerNotificationService.updateCustomerNotification(CNmodel).subscribe((resp) => {
            if (resp.error) {
              alert('Error- update customer/notifications');
              return;
            }
            this.localStorageServive.saveData(`${this.model.booking_ID}:customernotification`,
            JSON.stringify({customerNotificationInitialResponse : localData.customerNotificationInitialResponse, modelData : resp}));
            this.localStorageServive.clear(`${ApplicationService.instance.order_id}:OrderRoutingConfig`);
            this.saveEditNotes();
        });
      }
    } else {
      this.saveEditNotes();
    }

  });

}
saveEditNotes() {
  this.model.created_By = this.authService.userId;
  if (this.model.internal_Notes || this.model.folder_Notes  || this.model.invoice_Notes ) {
    this.notesService.createNotes(this.model, this.model.booking_ID).subscribe( response => {
      if (response.error) {
        alert('Error- create order/${bookingID}/notes');
        return;
      } else {
        this.localStorageServive.clear(`${this.model.booking_ID}:editNotes`);
        this.localStorageServive.clear(`${this.model.tariff_ID}:serviceLevels`);
        this.localStorageServive.clearBookingData(this.model.booking_ID);
        this.localStorageServive.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(this.orderResponse));
        this.localStorageServive.saveData(`${this.orderResponse.order_ID}:order`, JSON.stringify(this.orderResponse));
        this.clearNotesData();
        this.fetchDataLoad();
        this.validateService.validateCompleted({order:'saved'});
      }
    });
  } else {
    this.localStorageServive.clear(`${this.model.booking_ID}:editNotes`);
    this.localStorageServive.clear(`${this.model.tariff_ID}:serviceLevels`);
    this.localStorageServive.clearBookingData(this.model.booking_ID);
    this.localStorageServive.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(this.orderResponse));
    this.localStorageServive.saveData(`${this.orderResponse.order_ID}:order`, JSON.stringify(this.orderResponse));
    this.clearNotesData();
    this.fetchDataLoad();
    this.orderResponse = null;
    this.validateService.validateCompleted({order:'saved'});
  }
}
saveEditedNotesinCache() {
  if (this.isEditUrl) {
    this.localStorageServive.saveData(`${this.model.booking_ID}:editNotes`,
    JSON.stringify({initialNotesData : this.initialNotesData,  modelData : this.model}));
  }
}

}
