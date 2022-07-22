import {Component, OnInit, Input, HostBinding, OnDestroy, OnChanges,	Output,	ViewEncapsulation,
  ViewChildren, QueryList, EventEmitter, SimpleChanges,ChangeDetectionStrategy} from '@angular/core';
import { Subject } from 'rxjs';
//import {PhoneNumberPipe} from '../../../../../../core/pipes/phone-number.pipe';
import {InputTextComponent} from '../../../../../partials/components/inputtext/inputtext.component';
import {DropdownGridComponent} from '../../../../../partials/components/dropdown-grid/dropdown-grid.component';
import {ZIPCodeComponent} from '../../../../../partials/components/zip-code/zip-code.component';
import {AutopopulateInputTextComponent} from '../../../../../partials/components/autopopulate-inputtext/autopopulate-inputtext.component'
import { Router } from '@angular/router';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { OrigindestinationFreightService } from 'src/app/services/origin-destination-freight.service';
import AuthService from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],   
  encapsulation: ViewEncapsulation.None
})
export class AddressComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChildren(InputTextComponent) inputTextChildren :QueryList<InputTextComponent>;
  @ViewChildren(DropdownGridComponent) dropDownGridComponents: QueryList<DropdownGridComponent>;
  @ViewChildren(ZIPCodeComponent) zipCodeComponent: QueryList<ZIPCodeComponent>;
  @ViewChildren(AutopopulateInputTextComponent) autoPopulateComponents: QueryList<AutopopulateInputTextComponent>;

  @Input() title: string;
  @Input() label: string;
  @Input() type: string;
  @Input() addressModel: any;
  @Input() isEditMode?:boolean;
  @Input() isEditUrl?:boolean;

  @Output() addressModelChange: EventEmitter <any> = new EventEmitter();
  @Output() chargesButtonClick: EventEmitter <any> = new EventEmitter();


  public minDate = new Date();
  public isDateValid:boolean = true;
  public Shipper:any;
  public selectedTimeFormat:any;
  // public selectedAirPort:any;
  private isValid:Boolean = false;
  private searchTerms : string;
  ddReset: boolean = false;
  selectedShipper: any;
  selectedShipperAirportCodes: any[];
  airportCode:any;
  selectedAirport: any;
  load_Time_Code : any;
  delivery_Time_Code : any;
  origin_Show_ID:any;
  dest_Show_ID:any;
  errorMessage:any;
  autoComplete:any;

  ddShipperAddressHeaders: any[] = [['CODE','customer_code'],['NAME','address_name'],['ADDRESS','addr1'],['CITY','addr_sort1'],['STATE','addr_sort2'],['ZIP','addr_sort3'],['PHONE','attention_phone']];
  ddShipperAddressOptions: any[] = [];

  displayKey:string = 'booking_agent_id';
  airportCodeHeaders: any[] = [["CODE", "airport_code"], ["ZONE", "zone"], ["MILES", "miles"]];


  ddshowCodeHeaders:any[] = [["ID","show_id"],["Description","show_description"]] ;
  @Input() ddshowCodes: any[] = [];

  @Input() ddKsmsCategories: any[] = [];
  ddKsmsCategoriesHeaders: any[] = [ ["ID","category_id"],["Description","category_description"]];

  @Input() ddTimeOptions: any[];
  ddTimeOptionsHeaders: any[] = [["Code","code"],["Description","description"]]  ;

  ddServiceLevels: any[] =[];
  is_DP_Editable:boolean = true ;  
  constructor(private router: Router,
              private odfService: OrigindestinationFreightService,
              private utilityService: UtilitiesService,
              private localStorageService: LocalStorageService,
              private dialogService : DialogService,
              private rulesService:BusinessRulesService) {
  }

ngOnInit(): void {   
  // setTimeout(() => {
  //       this.getShowCodes();
  //       this.getKsmCategories();
  //       this.getTimeCodes();
  // }, 2000);
  const dp_fieldname:string = (this.isShipper())?'load_Date':'delivery_Date';
  this.is_DP_Editable = !this.isEditable(dp_fieldname);
}

ngOnChanges(changes:SimpleChanges){
  if(changes && changes.addressModel && changes.addressModel.currentValue  && changes.addressModel.currentValue !=  changes.addressModel.previousValue)
  {
   // this.getShowCodes();
   // this.getKsmCategories();
   // this.getTimeCodes();
    this.getAirportData();
  }
  if(changes && changes.ddshowCodes && changes.ddshowCodes.currentValue  && changes.ddshowCodes.currentValue !=  changes.ddshowCodes.previousValue){
    this.bindShowCodes();
    this.ddReset = false;
  }
  if(changes && changes.ddKsmsCategories && changes.ddKsmsCategories.currentValue  && changes.ddKsmsCategories.currentValue !=  changes.ddKsmsCategories.previousValue){
    this.ddReset = false;
  }

  if(changes && changes.ddTimeOptions && changes.ddTimeOptions.currentValue  && changes.ddTimeOptions.currentValue !=  changes.ddTimeOptions.previousValue){
    this.bindTimeCodes();
    this.ddReset = false;
  }

  // console.log('Addresschanges  : ',changes);
}

getAirportData() {
  if (this.addressModel && this.isShipper()) {
      if(this.addressModel.shipper_Zip){
          this.localStorageService.getData(`${this.addressModel.booking_ID}:shipperAirportCodes`).subscribe((result) => {
            if(result){
              this.selectedShipperAirportCodes = JSON.parse(result);
            }
          else
          {
            this.odfService.getShipperAirportCode(this.addressModel.shipper_Zip).subscribe(response => {
              this.selectedShipperAirportCodes = response; 
              this.localStorageService.saveData(`${this.addressModel.booking_ID}:shipperAirportCodes`, 
                    JSON.stringify(this.selectedShipperAirportCodes));     
            });
          }
      });
    }
  } 
  else
  {
      if(this.addressModel.consignee_Zip){      
        this.localStorageService.getData(`${this.addressModel.booking_ID}:consigneeAirportCodes`).subscribe((result) => {
          if(result){
            this.selectedShipperAirportCodes = JSON.parse(result);
          }
        else
        {
          this.odfService.getShipperAirportCode(this.addressModel.consignee_Zip).subscribe(response => {
            this.selectedShipperAirportCodes = response; 
            this.localStorageService.saveData(`${this.addressModel.booking_ID}:consigneeAirportCodes`, 
                  JSON.stringify(this.selectedShipperAirportCodes));          
          });
        }
      })
    }    
  }  
}
/*
getShowCodes() {
  this.localStorageService.getData(`${this.addressModel.booking_ID}:ShowCodes`).subscribe((result) => {
    if(result){
      this.ddshowCodes = JSON.parse(result);
      this.bindShowCodes();
    }
    else
    {
      this.utilityService.getShows().subscribe((response) => {
          this.ddshowCodes = response;
          this.bindShowCodes();
          this.localStorageService.saveData(`${this.addressModel.booking_ID}:ShowCodes`, JSON.stringify(this.ddshowCodes));
      });

    }
  })
}*/

bindShowCodes(){
  this.origin_Show_ID = '';
  this.dest_Show_ID = '';
  if(this.addressModel && this.ddshowCodes.length > 0)
  {
    if(this.isShipper() && this.addressModel.origin_Show_ID)
    {
      this.origin_Show_ID  = this.ddshowCodes.find( x => x.show_id== this.addressModel.origin_Show_ID).show_description;
    }
    else if(this.addressModel.dest_Show_ID){
      this.dest_Show_ID = this.ddshowCodes.find( x => x.show_id== this.addressModel.dest_Show_ID).show_description;
    }
  }
}
/*
getKsmCategories(){
  this.localStorageService.getData(`${this.addressModel.booking_ID}:KsmCategories`).subscribe((result) => {
    if(result){
          this.ddKsmsCategories = JSON.parse(result);
          this.ddReset = false;
    }else{
      this.utilityService.getKsmsCategories().subscribe(response => {
        console.log("ksms categories", response);
        this.ddKsmsCategories = response;
        this.localStorageService.saveData(`${this.addressModel.booking_ID}:KsmCategories`, JSON.stringify(this.ddKsmsCategories))
        this.ddReset = false;
     });
    }
  })
}*/
/*
getTimeCodes(){
  this.localStorageService.getData(`${this.addressModel.booking_ID}:TimeCodes`).subscribe((result) => {
      if(result){
        this.ddTimeOptions  = JSON.parse(result);
        this.bindTimeCodes();
        this.ddReset = false;
      }else{
          this.utilityService.getTimeCodes().subscribe(response => {
          console.log("TimeCodes ", response);
          this.ddTimeOptions  = response;
          this.bindTimeCodes();
          this.localStorageService.saveData(`${this.addressModel.booking_ID}:TimeCodes`, JSON.stringify(this.ddTimeOptions));
          this.ddReset = false;

       });
      }
  })

}*/

bindTimeCodes(){
  this.load_Time_Code = '';
  this.delivery_Time_Code = '';
  if(this.addressModel &&  this.ddTimeOptions.length > 0)
    {
      if(this.isShipper() && this.addressModel.load_Time_Code)
      {
        this.load_Time_Code  = this.ddTimeOptions.find( x => x.code== this.addressModel.load_Time_Code).description;
      }
      else if(this.addressModel.delivery_Time_Code){
        this.delivery_Time_Code = this.ddTimeOptions.find( x => x.code== this.addressModel.delivery_Time_Code).description;
      }
    }
}

ngOnDestroy(): void {

}
airportCodeChangehandler(event) {

}

TimeCodeChangehandler(event) {
    this.selectedTimeFormat = event.value;
 }

validateData(){
  this.errorMessage = "";
  let isDataValid = true;
  if(this.addressModel.shipper_Name == this.addressModel.consignee_Name)
  {
    this.errorMessage += "Shipper and Consignee name cannot be same.<br>";
    isDataValid = false
  }
  if(this.addressModel.load_Date > this.addressModel.delivery_Date)
  {
    this.errorMessage += "Del Date must be greater or equal to Load Date.<br>";
    isDataValid = false
  }
  if(this.addressModel.load_Time_From > this.addressModel.load_Time_To)
  {
    this.errorMessage += "Load Time From must be less than Load Time To.<br>";
    isDataValid = false
  }
  if(this.addressModel.delivery_Time_From > this.addressModel.delivery_Time_To)
  {
    this.errorMessage += "Del Time From must be less than Del Time To.<br>";
    isDataValid = false
  }
  return isDataValid;
}

  validateTimeData(){
    this.errorMessage = ""
    if(this.isShipper() && this.addressModel.load_Time_From > this.addressModel.load_Time_To)
    {
      this.errorMessage = "Load Time From must be less than Load Time To.";
      return false;
    }
    else if(!this.isShipper() && this.addressModel.delivery_Time_From > this.addressModel.delivery_Time_To)
    {
      this.errorMessage = "Del Time From must be less than Del Time To.";
      return false;
    }
    else{
      return true;
    }
  }

validateInputElement(){
  this.isValid = true;
  if (this.inputTextChildren) {
    for (let inputText of this.inputTextChildren.toArray()) {
      if(!inputText.validateInputElement())
      {
        this.isValid = false
      }
    }
  }
  if (this.dropDownGridComponents) {
    for (let dropdown of this.dropDownGridComponents.toArray()) {
      if(!dropdown.validateInputElement())
      {
        this.isValid = false
      }
    }
  }
  if(this.zipCodeComponent){
      for(let zipCode of this.zipCodeComponent.toArray())
      {
        if(!zipCode.validateInputElement())
        {
          this.isValid = false
        }
      }
    }
  if (this.autoPopulateComponents) {
      for (let autoPopulate of this.autoPopulateComponents.toArray())
      {
        if(!autoPopulate.validateInputElement())
        {
          this.isValid = false
        }
      }
    }
  if (this.isShipper() && this.addressModel.load_Date == (undefined || null) ){
    this.isValid = this.isDateValid = false;
    }
  else if (!this.isShipper() && this.addressModel.delivery_Date == (undefined || null)) {
      this.isValid =  this.isDateValid = false;
    }
  // if(!this.validateData()){
  //   this.isValid = false;
  // }
  return this.isValid;
}
bindModel(shiperObj: any) {
  if (this.isShipper()) {
    this.addressModel.shipper_Address1 = shiperObj.addr1;
    this.addressModel.shipper_Address2 = shiperObj.addr2;
    this.addressModel.shipper_City = shiperObj.addr_sort1;
    this.addressModel.shipper_State = shiperObj.addr_sort2;
    this.addressModel.shipper_Zip = shiperObj.addr_sort3;
    this.addressModel.shipper_Attention = shiperObj.attention_name;
    this.addressModel.shipper_Cell =  shiperObj.phone_1;
    this.addressModel.shipper_Email = shiperObj.attention_email;
    this.addressModel.shipper_Phone = shiperObj.attention_phone;
  } else {
    this.addressModel.consignee_Address1 = shiperObj.addr1 ;
    this.addressModel.consignee_Address2 = shiperObj.addr2  ;
    this.addressModel.consignee_City = shiperObj.addr_sort1 ;
    this.addressModel.consignee_State = shiperObj.addr_sort2   ;
    this.addressModel.consignee_Zip = shiperObj.addr_sort3 ;
    this.addressModel.consignee_Attention = shiperObj.attention_name ;
    this.addressModel.consignee_Cell = shiperObj.phone_1 ;
    this.addressModel.consignee_Email = shiperObj.attention_email  ;
    this.addressModel.consignee_Phone = shiperObj.attention_phone  ;
  }
}
ddShipperChangeHandler(event) {

  // this.ddReset = true;

  if (this.isShipper()) {
    if (this.addressModel.shipper_Name !== event[this.ddShipperAddressHeaders[1][1]]) {      
      this.ddReset = true && !this.isEditUrl;
    }
  }
  else {
    if (this.addressModel.consignee_Name !== event[this.ddShipperAddressHeaders[1][1]]) {
      this.ddReset = true && !this.isEditUrl;
    }
  }

  this.selectedShipper = event;
  this.bindModel(event);

  if (this.selectedShipper["addr_sort3"] && this.selectedShipper["addr_sort3"] !== "") {
    this.odfService.getShipperAirportCode(this.selectedShipper["addr_sort3"]).subscribe(response => {
      this.selectedShipperAirportCodes = response;
      if(this.isShipper()){
        this.localStorageService.saveData(`${this.addressModel.booking_ID}:shipperAirportCodes`, JSON.stringify(this.selectedShipperAirportCodes));
      }else{
        this.localStorageService.saveData(`${this.addressModel.booking_ID}:consigneeAirportCodes`, JSON.stringify(this.selectedShipperAirportCodes));          
      }

      if (this.selectedShipperAirportCodes.length === 1)
      {
        this.selectedAirport = this.selectedShipperAirportCodes[0];
        this.bindAirportData();

      }
      else if(this.selectedShipperAirportCodes.length > 1){
        this.selectedAirport = this.selectedShipperAirportCodes.sort((n1,n2) => n1.miles - n2.miles)[0];
        this.bindAirportData();
      }
      else{
        if (this.addressModel && this.isShipper()) {
          this.addressModel.origin_Zone =   '';

        } else {
          this.addressModel.dest_Zone =   '';
        }
      }
      this.ddReset = false;
    });
  }  

  if (this.addressModel) {
    if (this.isShipper()) {

      this.addressModel.shipper_Name =   this.selectedShipper[this.ddShipperAddressHeaders[1][1]];
    } else {
      this.addressModel.consignee_Name =   this.selectedShipper[this.ddShipperAddressHeaders[1][1]];
    }
  }
}

bindAirportData(){
  this.airportCode = this.selectedAirport[this.airportCodeHeaders[0][1]]
  if (this.addressModel && this.isShipper()) {
      this.addressModel.origin_Air_Code =   this.selectedAirport[this.airportCodeHeaders[0][1]];
      this.addressModel.origin_Zone =   this.selectedAirport[this.airportCodeHeaders[1][1]];
      this.localStorageService.saveData(`${this.addressModel.booking_ID}:shipper_zone`, this.addressModel.origin_Zone);

    } else {
      this.addressModel.dest_Air_Code =   this.selectedAirport[this.airportCodeHeaders[0][1]];
      this.addressModel.dest_Zone =   this.selectedAirport[this.airportCodeHeaders[1][1]];
      this.localStorageService.saveData(`${this.addressModel.booking_ID}:consignee_zone`, this.addressModel.dest_Zone);
    }
}

serchTextChangehandler (event) {
  if(event.trim() == "")
  {
    return;
  }
  if (this.searchTerms !== event) {
    this.searchTerms = event ;
    this.odfService.search(event).subscribe((response) => {
      this.ddShipperAddressOptions =  [];
      if(response.error){
        const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,Messages.SERVER_ERROR);
        return;
      }
      else if(response && response.length == 0){
        const dialogRef = this.dialogService.showInfoPopup(Messages.SEARCH_ORDER_TITLE,Messages.NO_RECORDS);
        return;
      }
      else{
      this.ddShipperAddressOptions =  response;
      }
    });
  }
}

airportCodeSelectHandler (event) {
  this.selectedAirport = event;
  if (this.addressModel) {
  if (this.isShipper() && this.addressModel) {
    this.addressModel.origin_Air_Code =   this.selectedAirport.airport_code;
    this.addressModel.origin_Zone = this.selectedAirport.zone
    this.localStorageService.saveData(`${this.addressModel.booking_ID}:shipper_zone`, this.selectedAirport.zone);
  } else {
    this.addressModel.dest_Air_Code =   this.selectedAirport.airport_code;
    this.addressModel.dest_Zone = this.selectedAirport.zone
    this.localStorageService.saveData(`${this.addressModel.booking_ID}:consignee_zone`, this.selectedAirport.zone);
  }
}
}
showCodesSelecthandler(event, key) {
  if (this.addressModel) {
    if (this.isShipper() ) {
      this.addressModel.origin_Show_ID =   event[key];
    } else {
      this.addressModel.dest_Show_ID =    event[key];
    }
    this.emitEvent();
  }
}
KsmsCategoriesSelecthandler(event, key) {
  if (this.addressModel) {
    if (this.isShipper() ) {
      this.addressModel.origin_KSMS_Number =   event[key];
    } else {
      this.addressModel.dest_KSMS_Number =    event[key];
    }
    this.emitEvent();
  }
}
ksmsTextChangehandler(event){
  if (this.addressModel) {
    if (this.isShipper() ) {
      this.addressModel.origin_KSMS_Number =   event;
    } else {
      this.addressModel.dest_KSMS_Number =    event;
    }
    this.emitEvent();
  }
}
TimeOptionsHeadersSelecthandler(event, key) {
  if (this.addressModel) {
    if (this.isShipper() ) {
      this.addressModel.load_Time_Code =   event[key];
    } else {
      this.addressModel.delivery_Time_Code =    event[key];
    }
    this.emitEvent();
  }
}

gotoSpecialCharges($event) {
  this.chargesButtonClick.emit({path:'specialcharges', type:this.isShipper()});
}
gotoViewCharges($event)
{
  this.chargesButtonClick.emit({path:'viewcharges', type:this.isShipper()});
}
zoneChangehandler(event) {
  if (this.addressModel) {
  if (this.isShipper()  ) {
    this.addressModel.origin_Zone =  event;
  } else {
    this.addressModel.dest_Zone =   event;
  }
  this.emitEvent();
}
}
addres1Changehandler(event) {
  if (this.addressModel) {
      if (this.isShipper()  ) {
        this.addressModel.shipper_Address1 =  event;
      } else {
        this.addressModel.consignee_Address1 =   event;
      }
      this.emitEvent();
  }
}
addres2Changehandler(event) {
  if (this.addressModel) {
    if (this.isShipper()) {
      this.addressModel.shipper_Address2 =  event;
    } else {
      this.addressModel.consignee_Address2 =   event;
    }
    this.emitEvent();
  }
}
cityChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.shipper_City =  event;
  } else {
    this.addressModel.consignee_City =   event;
  }
  this.emitEvent();
}
}
stateChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.shipper_State =  event;
  } else {
    this.addressModel.consignee_State =   event;
  }
  this.emitEvent();
}
}
zipCodeChangeHandler(event){
  if (this.addressModel) {
    if (this.isShipper()) {
      this.addressModel.shipper_Zip =  event;
    } else {
      this.addressModel.consignee_Zip =   event;
    }
    this.emitEvent();
  }
}
getDate() {
  let date: any;
  if (this.addressModel) {
    if (this.isShipper() && this.addressModel.load_Date != null) {
        date = this.addressModel.load_Date;
        //date = new Date(this.addressModel.load_Date);
      } else if (!this.isShipper() && this.addressModel.delivery_Date != null) {
        date = this.addressModel.delivery_Date;
        //date = new Date(this.addressModel.delivery_Date);
      }
  }
 return date;
}
dateChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.load_Date = this.convert(event.value) ;
  } else {
    this.addressModel.delivery_Date = this.convert(event.value) ;;
  }
  this.isDateValid = true;
  this.emitEvent();
}
}

timeFromChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.load_Time_From =  event;
  } else {
    this.addressModel.delivery_Time_From =   event;
  }
  this.emitEvent();
}
}
timeToChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.load_Time_To =  event;
  } else {
    this.addressModel.delivery_Time_To =   event;
  }
  this.emitEvent();
}
}
AttentionChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.shipper_Attention =  event;
  } else {
    this.addressModel.consignee_Attention =   event;
  }
  this.emitEvent();
}
}
CellChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.shipper_Cell =  event;
  } else {
    this.addressModel.consignee_Cell =   event;
  }
  this.emitEvent();
}
}
emailChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.shipper_Email =  event;
  } else {
    this.addressModel.consignee_Email =   event;
  }
  this.emitEvent();
}
}
phoneChangehandler(event) {
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.shipper_Phone =  event;
  } else {
    this.addressModel.consignee_Phone =   event;
  }
  this.emitEvent();
}
}
showCodeChangehandler(event){
  if (this.addressModel) {
  if (this.isShipper()) {
    this.addressModel.origin_Show_ID =  event;
  } else {
    this.addressModel.dest_Show_ID =   event;
  }
  this.emitEvent();
}
}
boothChangehandler(event){
  if (this.addressModel) {
    if (this.isShipper()) {
      this.addressModel.origin_Booth =  event;
    } else {
      this.addressModel.dest_Booth =   event;
    }
    this.emitEvent();
  }
}
isShipper() {
  return this.type === 'Shipper';
}
emitEvent() {
  this.addressModelChange.emit(this.addressModel);
}
convert(date) {
  const mnth = ("0" + (date._i.month + 1)).slice(-2);
  const day = ("0" + date._i.date).slice(-2);
  return [date._i.year, mnth, day].join("-");
}

private isEditable(fieldName) {   
      //console.log('++++++++++++++++++++ isEditable calling +++++++++');    
      if(this.isEditUrl && this.isEditMode) {  
        return this.rulesService.shouldEditable(fieldName);
       }
      return this.isEditMode;
    }

}
