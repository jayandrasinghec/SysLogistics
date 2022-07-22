import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation, ViewChildren, QueryList, ViewChild} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {AddressComponent} from './address/address.component';
import {FreightComponent} from './freight/freight.component';
import {ValidateService} from '../../../../../services/validate.service';
import { Subscription } from 'rxjs/internal/Subscription';
import {ODFModel} from '../../../../../core/models/odf.model';
import {BookingService} from '../../../../../services/booking.service';
import {  ApplicationService} from '../../../../../services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { OrigindestinationFreightService } from 'src/app/services/origin-destination-freight.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-orig-dest-freight',
  templateUrl: './origin-destination-freight.html',
  styleUrls: ['./origin-destination-freight.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrigindestinationFreightComponent implements OnInit, OnDestroy {
  private isValid: Boolean = false;
  private validateSubscription: Subscription;
  private routerSubscription:Subscription;
  public model: BookingOrder;
  authService: any;
  isEditMode:boolean = true; 
  isEditUrl:boolean = false;
  currentUrl:string;
@ViewChildren(AddressComponent) addressComponent : QueryList<AddressComponent>;
//Note change the below ViewChildren to ViewChild
@ViewChildren(FreightComponent) freightComponent : QueryList<FreightComponent>;

ddshowCodes: Array<any>;
ddKsmsCategories: Array<any>;
ddTimeOptions: Array<any>;
ddServiceLevels: Array<any>;

constructor(private validateService: ValidateService,
            private bookService: BookingService,
            private localStorageService: LocalStorageService,
            private router: Router,
            private activatedRoute: ActivatedRoute,
            private utilsService: UtilsService,
            private utilityService: UtilitiesService,
            private odfService: OrigindestinationFreightService,
            private dialogService : DialogService) {
              this.model = new BookingOrder();
              this.authService = AuthService.getInstance();
              this.routerSubscription = this.router.events.subscribe((event)=>{this.init(event)});
              ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('orderId');
}
init(event: any){
  if(event instanceof NavigationEnd){
    this.currentUrl = event.url;
    this.isEditMode = (event.url.indexOf('view-booking')!== -1)?false:true;
    this.isEditUrl = (event.url.indexOf('edit-booking')!== -1)?true: false;

    this.model.booking_ID = this.activatedRoute.snapshot.paramMap.get('id') || this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_booking_id`);
    this.model.order_ID = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`);
    ApplicationService.instance.booking_id = this.model.booking_ID;
    if (this.authService.hasToken) {
      this.fetchDataLoad();
    } else {
      this.router.navigateByUrl("login");
    }
  }

}

fetchDataLoad(){
    const orderType = (this.isEditUrl) ? 'editBookingOrder' : 'bookingOrder';
    this.localStorageService.getData(`${this.model.booking_ID}:${orderType}`).subscribe((result)=>{
      if(result){
        this.model =  JSON.parse(result);
        this.fetchlocalStoragDataByBookingId();
        this.fetchDropdownData();

      }else{
        if(this.model.order_ID){
          this.bookService.getOrderData(this.model.order_ID).subscribe(async (result:any)=>{
            this.model =  await result;
            this.localStorageService.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(this.model))
            this.fetchlocalStoragDataByBookingId();
            this.fetchDropdownData();
          });
        }
        else{
          this.bookService.getBookingData(this.model.booking_ID).subscribe(async (result:any)=>{
            this.model =  await result;
            this.fetchlocalStoragDataByBookingId();
            this.fetchDropdownData();
          });
        }
      }
    })


   }

fetchlocalStoragDataByBookingId()
{
       // Local storage have the latest value for dimensionS
      //if(!this.model.weight_Dimensional_LB){
        this.localStorageService.getData(`${this.model.booking_ID}:weight_Dimensional_LB`).subscribe((result) => {
          if(result){
          this.model.weight_Dimensional_LB = Number(result);
          }else{
            this.localStorageService.saveData(`${this.model.booking_ID}:weight_Dimensional_LB`, this.model.weight_Dimensional_LB);
          }
        });
      //}
      //if(!this.model.weight_Dimensional_KG){
        this.localStorageService.getData(`${this.model.booking_ID}:weight_Dimensional_KG`).subscribe((result) => {
          if(result){
            this.model.weight_Dimensional_KG = Number(result);
            }else{
              this.localStorageService.saveData(`${this.model.booking_ID}:weight_Dimensional_KG`, this.model.weight_Dimensional_KG);
            }
        });
      //}
      //if(!this.model.tariff_ID){
        this.localStorageService.getData(`${this.model.booking_ID}:tariff_ID`).subscribe((result) => {
          if(result){
            this.model.tariff_ID = result;

            }else{
              this.localStorageService.saveData(`${this.model.booking_ID}:tariff_ID`, this.model.tariff_ID);
            }
            this.getServiceLevels();
        });
      //}
      //if(!this.model.customer_Code){
        this.localStorageService.getData(`${this.model.booking_ID}:customer_Code`).subscribe((result) => {
            if(result){
              this.model.customer_Code = result;
              }else{
                this.localStorageService.saveData(`${this.model.booking_ID}:customer_Code`, this.model.customer_Code);
              }
          });
      //}
}

ngOnInit(): void {
  this.validateSubscription = this.validateService.validateComponentEvent$.subscribe(event => this.validateChildComponent(event))
  this.isValid = true ;
}

ngOnDestroy(): void {
  this.model = null;
  this.validateSubscription.unsubscribe();
  this.validateSubscription = null
  this.routerSubscription.unsubscribe();
  this.routerSubscription=null;
}

fetchDropdownData(){
  /*---------------------*/
  this.getShowCodes();
  this.getKsmCategories();
  this.getTimeCodes();
  /*---------------------*/
}

validateChildComponent(event){
  if(event && event.tabIndex == 0)
  {
    if(event.type == "prev" || event.newIndex == 1)
    {
      //this.localStorageService.saveData(`${this.model.booking_ID}:odf`, JSON.stringify(this.model))
      const orderType = (this.isEditUrl) ? 'editBookingOrder' : 'bookingOrder';
      this.localStorageService.saveData(`${this.model.booking_ID}:${orderType}`, JSON.stringify(this.model))
      event.isValid = true
      this.validateService.validateCompleted(event)
      //this.updateBooking(event);
    }
    else if(this.validateAndUpdateBooking())
      {
        if(this.isValid) {
          if (!this.isEditUrl){ //if edit mode then updae the editBookingOrder in localstorage
            this.updateBooking(event);
          } else {
            if (event) {
              event.isValid = true;
              this.validateService.validateCompleted(event);
              }
            // this.updateEditOrderCache(event);
          }

          //
          }
    }
    this.isValid = true;
  }
}

validateAndUpdateBooking()
{
    var message = '';
    if(this.addressComponent){
        for(let address of this.addressComponent.toArray())
        {
          if(!address.validateInputElement())
          {
            this.isValid = false;
          }
          else if(!address.validateData()){
            this.isValid = false;
            message = address.errorMessage;
          }
        }
    }
    if(this.freightComponent){
        for(let freight of this.freightComponent.toArray())
        {
          if(!freight.validateInputElement())
          {
            this.isValid = false;
          }
          else if(!freight.validateData()){
            this.isValid = false;
            message = message +  freight.errorMessage;
          }
        }
    }
    if(message){
    const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,message);
    }
    return this.isValid;
}

validateAndUpdateAddress(type:any){
  if(this.addressComponent){
    for(let address of this.addressComponent.toArray())
    {
      if(address.type.toLowerCase() == type){
      if(!address.validateInputElement())
      {
        this.isValid = false;
      }
      if(!address.validateTimeData()){
        this.isValid = false;
        const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,address.errorMessage);
      }
    }
  }
  }
  return this.isValid;
}

validateAndUpdateFreight(){
    if(this.freightComponent){
      for(let freight of this.freightComponent.toArray())
      {
        if(!freight.validateInputElement())
        {
          this.isValid = false;
        }
        if(!freight.validateData()){
          this.isValid = false;
          const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,freight.errorMessage);
        }
      }
  }
  return this.isValid;
}

updateBooking(event) {
  this.model.current_Editing_By = this.authService.userId;
  this.bookService.updateBooking(this.model).subscribe((response) => {
    if(response && response.error)
    {
      alert('Error- update customer/order');
      return;
    }
    if(response ){
      //this.localStorageService.saveData(`${this.model.booking_ID}:odf`, JSON.stringify(response))
      this.localStorageService.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response))

      if(event.type=="next" && this.model.order_ID === undefined){
        this.localStorageService.getTabStatusData(`${response.booking_ID}:tabstatus`).subscribe((result) => {
          let tabStatus = result as Boolean[];
          // index 3 is for notes tab.
          if(tabStatus[3] == true)
          {
            this.localStorageService.saveTabStausData(`${response.booking_ID}:tabstatus`, [false,false,false,true])
          }
        })
      } else if (response && this.model.order_ID && this.model.order_ID !== '' ) {
        event = Object.assign( event, {isValid: true});
        this.validateService.validateCompleted(event);
        return ;
      }
      // this.localStorageService.saveData(`${this.model.booking_ID}:odf`, JSON.stringify(response))
      // this.localStorageService.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response))
      event.isValid = true
      this.validateService.validateCompleted(event)
    }
  });
}
updateEditOrderCache(model) {
  this.localStorageService.saveData(`${this.model.booking_ID}:editBookingOrder`, JSON.stringify(model));
 /* if (event) {
  event.isValid = true;
  this.validateService.validateCompleted(event);
  }*/
}

modelChangehandler(event) {
  // if its in edit mode update the editBookingOrder localStorage
  if(this.isEditUrl){
    this.updateEditOrderCache(event);
  }

}

calcDimensionClickHandler(event){
  if(this.validateAndUpdateFreight())
  {
    if(this.isValid) {
      if(!this.isEditUrl){
          this.bookService.updateBooking(this.model).subscribe((response) => {
                  if(response  ){
                    //this.localStorageService.saveData(`${this.model.booking_ID}:odf`, JSON.stringify(response))
                    this.localStorageService.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response))
                    this.localStorageService.saveData(`${this.model.booking_ID}:navigateUrl`, this.currentUrl);
                    this.router.navigateByUrl(`calculatediamensions/${this.model.booking_ID}`);
                }
          });
      } else {
        this.updateEditOrderCache(this.model);
        this.localStorageService.saveData(`${this.model.booking_ID}:navigateUrl`, this.currentUrl);
        this.router.navigateByUrl(`calculatediamensions/${this.model.order_ID}/${this.model.booking_ID}`);
      }
      //
      }
  }
  this.isValid = true;
}

chargesButtonClickHandler(event){
  const type = event.type ? 'shipper' : 'consignee';
  if(this.validateAndUpdateAddress(type))
  {
    if(this.isValid) {
      if(!this.isEditUrl){
        this.bookService.updateBooking(this.model).subscribe((response) => {
          if(response  ){
            //this.localStorageService.saveData(`${this.model.booking_ID}:odf`, JSON.stringify(response))
            this.localStorageService.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response))
            this.localStorageService.saveData(`${this.model.booking_ID}:navigateUrl`, this.currentUrl);
            this.router.navigateByUrl(`${event.path}/${this.model.booking_ID}/${type}`);
         }
        });
      } else {
        this.updateEditOrderCache(this.model);
        this.localStorageService.saveData(`${this.model.booking_ID}:navigateUrl`, this.currentUrl);
        this.router.navigateByUrl(`${event.path}/${this.model.booking_ID}/${type}`);
      }
      //
      }
  }
  this.isValid = true;
}

viewDimensionClickHandler(event) {
  if(this.validateAndUpdateFreight())
  {
    if(this.isValid) {
      if(!this.isEditUrl){
          this.bookService.updateBooking(this.model).subscribe((response) => {
                  if(response  ){
                    //this.localStorageService.saveData(`${this.model.booking_ID}:odf`, JSON.stringify(response))
                    this.localStorageService.saveData(`${this.model.booking_ID}:bookingOrder`, JSON.stringify(response))
                    this.localStorageService.saveData(`${this.model.booking_ID}:navigateUrl`, this.currentUrl);
                    this.router.navigateByUrl(`viewdimensions/${this.model.booking_ID}`);
                }
          });
      } else {
        this.updateEditOrderCache(this.model);
        this.localStorageService.saveData(`${this.model.booking_ID}:navigateUrl`, this.currentUrl);
        this.router.navigateByUrl(`viewdimensions/${this.model.booking_ID}`);
      }
      //
      }
  }
  this.isValid = true;
}
getShowCodes() {
  this.localStorageService.getData(`ShowCodes`).subscribe((result) => {
    if (result) {
      this.ddshowCodes = JSON.parse(result);
    } else {
      this.utilityService.getShows().subscribe((response) => {
          this.ddshowCodes = response;
          this.localStorageService.saveData(`ShowCodes`, JSON.stringify(this.ddshowCodes));
      });

    }
  });
}
getKsmCategories(){
  this.localStorageService.getData(`KsmCategories`).subscribe((result) => {
    if (result) {
          this.ddKsmsCategories = JSON.parse(result);
    } else {
      this.utilityService.getKsmsCategories().subscribe(response => {
        this.ddKsmsCategories = response;
        this.localStorageService.saveData(`KsmCategories`, JSON.stringify(this.ddKsmsCategories));
     });
    }
  });
}
getTimeCodes() {
  this.localStorageService.getData(`TimeCodes`).subscribe((result) => {
      if (result) {
        this.ddTimeOptions  = JSON.parse(result);
      } else {
          this.utilityService.getTimeCodes().subscribe(response => {
          this.ddTimeOptions  = response;
          this.localStorageService.saveData(`TimeCodes`, JSON.stringify(this.ddTimeOptions));
       });
      }
  });

}
getServiceLevels() {

  this.localStorageService.getData(`${this.model.tariff_ID}:serviceLevels`).subscribe((result) => {
    if (result) {
      this.ddServiceLevels  =  JSON.parse(result);
      } else {
        this.odfService.getServiceLevels(this.model.tariff_ID).subscribe(response => {
          this.ddServiceLevels  = response;
          this.localStorageService.saveData(`${this.model.tariff_ID}:serviceLevels`, JSON.stringify(this.ddServiceLevels));
       });
      }
  });
}


}
