import {  Component,  OnInit,  Input,  HostBinding,ViewChildren, QueryList,  OnDestroy,  Output,  ViewEncapsulation,  HostListener,  ViewChild,  OnChanges,  EventEmitter,  SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
 ;
import { ReportComponent } from 'src/app/content/partials/components/report/report.component'

import AuthService from '../../../../../../../services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import  {OperationsService} from 'src/app/services/operation.service';
import { MatDialog } from '@angular/material';
 import {PhoneNumberComponent} from '../../../../../../partials/components/phone-number/phone-number';
 import {InputTextComponent} from '../../../../../../partials/components/inputtext/inputtext.component';
import {DropdownGridComponent} from '../../../../../../partials/components/dropdown-grid/dropdown-grid.component';
import { BookingService } from '../../../../../../../services/booking.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-pickup-alert',
  templateUrl: './pickup-alert.component.html',
  styleUrls: ['./pickup-alert.component.css'],   
})
export class PickupAlertComponent implements OnInit {
@ViewChildren(PhoneNumberComponent) inputPhoneChildren :QueryList<PhoneNumberComponent>;
@ViewChildren(DropdownGridComponent) dropDownGridComponents: QueryList<DropdownGridComponent>;
@ViewChildren(InputTextComponent) inputTextChildren: QueryList<InputTextComponent>;

@Input() order: any ;
@Input() type: any ;
@Input() alertOptions:any;
@Input() routingAgent:any;
@Input() carriersList:any;

private orderId:any;
private orderData: any;
public formModel:any;
public ddCarriersHeaders:any[] =[['CODE','carrierCode'],['NAME','carrierName']];
public editDisabled:boolean = true;
public isUpdate:boolean = false;
public isEditMode:boolean = true;
public selectedCarrier:any;
public isSubmit:boolean = false;
public pickup_Agent_Name:any;
public pickupAlert:any;
private destroy$: Subject<boolean> = new Subject<boolean>();


public disable_alert_Option:boolean = false;
public disable_known_Shipper:boolean = false;
public disable_include_Declared_Value:boolean = false;
public disable_must_Check_ID:boolean = false;
 


constructor(private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService, 
               private router: Router,
               private operationService: OperationsService,
                public dialog: MatDialog,
                private dialogService : DialogService,
                private bookingService: BookingService,
                private rulesService:BusinessRulesService ) { }

  ngOnInit() {
     this.orderId = this.activatedRoute.snapshot.paramMap.get('orderid') ; 
     //this.orderData = this.bookingService.getOrderData(this.orderId);
     this.bookingService.getOrderData(this.orderId).pipe(takeUntil(this.destroy$)).subscribe((result)=> {
      this.orderData = result;
     });
     
    this.configModel();
    this.getPickupDeliveryAlert();     
            
  }
  ngOnChanges(changes)
  {
    console.log('changes  ', changes);
    if(changes && changes.routingAgent &&   changes.routingAgent.currentValue !== undefined && changes.routingAgent.currentValue !==  changes.routingAgent.previousValue ) {
        console.log('changes routingAgent  ', changes.routingAgent.currentValue);
        const routingAgents = changes.routingAgent.currentValue;
        for(let item of routingAgents){
          if(item.pickup_Agent_Name != null){
            this.pickup_Agent_Name = item.pickup_Agent_Name;
          }
        }

    }    
    if(changes && changes.alertOptions &&   changes.alertOptions.currentValue !== undefined && changes.alertOptions.currentValue !==  changes.alertOptions.previousValue ) {
      console.log('changes.type.currentValue  ',changes.alertOptions.currentValue);
      this.alertOptions = changes.alertOptions.currentValue.filter(item=> item.alert_Type =='PU')
    }  
  }
  configModel(){
     this.formModel =  {
          alert_Type: this.type,          
          created_By: AuthService.getInstance().userId  ,  
          cross_Declared_Value: null,         
          fax_Number: null,
          include_Declared_Value: null,
          known_Shipper: null,   
          must_Check_ID: null,
          order_ID:  this.orderId,
          phone_Number: null,
          special_Instruction: null,
          alert_Option:null,
          alert_Option_Description:null,
          carrier_Name:null,
          carrier_Code :null
    }
  }
   
  
  getPickupDeliveryAlert(){
     
    this.operationService.getPickupDeliveryAlert(this.orderId,this.type).subscribe((result:any)=>{
          console.log('getPickupDeliveryAlert  ',result);
          if(result.error){
            alert('Error - get pickupdelivery/alert');
          }
          if(result && result.pickupDeliveryAlert && result.pickupDeliveryAlert.length>0)
          {

              const pickupAlert:any = result.pickupDeliveryAlert.find(item => item.alert_Type =='PU');
              if( pickupAlert )
              {
                  this.pickupAlert = Object.assign({},pickupAlert);
                  this.formModel = pickupAlert ;
                  this.editDisabled =false;
                  this.isEditMode = false;
                  this.selectedCarrier = this.formModel.carrier_Name;
                  this.isUpdate = true;
              }          
          }
          this.enableRadioButtons();  
    });
  }
  isPickupAlert(data:any){
    if(data.pickupDeliveryAlert && data.pickupDeliveryAlert.length>0){
      const deliveryAlerts:any = data.pickupDeliveryAlert.filter(item => item.alert_Type =='PU');
      if(deliveryAlerts&&deliveryAlerts.length>0){
        return true; 
      }
    }
    return false; 
  }

  changeModel(event:any, type:any)
  {
    this.formModel[type]= event;
    console.log('phone_number',this.formModel[type]);
  }
  alertOptionChange(event){
    if(event){
      this.formModel.alert_Option = event.alert_Option;
      this.formModel.alert_Option_Description = event.alert_Option_Description;
    }
  }
  knownShipperChange(event){
    console.log(event.target.value);
      this.formModel.known_Shipper = event.target.value;
  }
  mustCheckIdChanged(event){
      console.log(event.target.value);
      this.formModel.must_Check_ID = event.target.value;
  }
  ddCarrierSelecthandler(event){
      console.log(event);
      this.formModel.carrier_Code = event.carrierCode;
      this.formModel.carrier_Name = event.carrierName;
  }
  /*--------------------*/
closeBtnClickhandler(event)
{
 if(this.isDirty()){
    this.showWarning();
    return;
  }
  const prevURL:string =  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
  this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
  this.router.navigateByUrl(prevURL);
}
previewBtnClickhandler(event){
  const parameters = [];
  if(this.orderData) {
    for (const item in this.orderData) {
      parameters.push({Name: item, Value: [this.orderData[item]]})
    };
  }
    const dialogRef = this.dialog.open(ReportComponent,
      { width: '80%',height:'95%', data: {rdlxJSON_path:'assets/reports/pickupReport.rdlx-json',json:parameters  }, panelClass: 'custom_popup' });

    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) { 

    }    
   });

}
emailBtnClickhandler(event){
  window.open("mailto:yourmail@domain.com");
}
editBtnClickhandler(event){
   this.editDisabled =true;  
   this.isEditMode  =true;
   this.enableRadioButtons(); 
}
saveBtnClickhandler(event){
  console.log('this.formModel        ',this.formModel);
  this.isSubmit =true;
  if(!this.validateInput()){
    return false;
  } 
  this.operationService.savePickupDeliveryAlert(this.formModel).subscribe((result:any)=>{
    if(result.error){
      alert('Error - save pickupdelivery/alert');
    }
    console.log('saveAlert result ',result);
    this.editDisabled =false;
    this.isUpdate = true;
    this.isEditMode  =false;
    this.pickupAlert = Object.assign({},result);
    this.formModel = result;
    this.enableRadioButtons();
  }) 

}
updateBtnClickhandler(event){
  this.isSubmit =true;
  if(!this.validateInput()){
    return false;
  } 
  this.operationService.updatePickupDeliveryAlert(this.formModel).subscribe((result:any)=>{
    if(result.error){
      alert('Error - update pickupdelivery/alert');
    }

    this.editDisabled =false;
   // this.isUpdate = false;
    this.isEditMode  =false;
    this.pickupAlert = Object.assign({},result);
    this.formModel = result;
    this.enableRadioButtons();
  })
}

validateInput(){
  let isValid = true;
  if(this.inputPhoneChildren) {
    for (let inputText of this.inputPhoneChildren.toArray()) {
      if(!inputText.validateInputElement()){
        isValid = false;
      }
    }
  }

  if(this.inputTextChildren) {
    console.log('this.inputTextChildren.toArray()   : ',this.inputTextChildren.toArray());
    for (let inputText of this.inputTextChildren.toArray()) {
      if(!inputText.validateInputElement())
      {
        isValid = false;
      }
    }
  }
  if (this.dropDownGridComponents) {
    for (let dropdown of this.dropDownGridComponents.toArray()) {
      if(!dropdown.validateInputElement()){
        isValid = false;
      }
    }
  } 
  if(this.formModel.alert_Option == null || this.formModel.known_Shipper == null ||
    this.formModel.must_Check_ID == null || this.formModel.special_Instruction == null ||
     this.formModel.special_Instruction == '' ){
   isValid = false;
  }
  return isValid ;
}
isDirty(){
  if(this.pickupAlert== undefined){
      return (this.formModel.cross_Declared_Value != null && this.formModel.cross_Declared_Value != "") 
      || (this.formModel.fax_Number != null && this.formModel.fax_Number != "") 
      || this.formModel.include_Declared_Value != null ||  this.formModel.known_Shipper != null
      ||  this.formModel.must_Check_ID != null || (this.formModel.phone_Number != null && this.formModel.phone_Number != "")
      ||  (this.formModel.special_Instruction != null &&  this.formModel.special_Instruction != "" ) 
      ||  this.formModel.alert_Option != null
      ||  this.formModel.alert_Option_Description != null ||  this.formModel.carrier_Name != null
      ||  this.formModel.carrier_Code != null
  }else{
     return this.formModel.cross_Declared_Value !=  this.pickupAlert.cross_Declared_Value || this.formModel.fax_Number != this.pickupAlert.fax_Number 
      || this.formModel.include_Declared_Value != this.pickupAlert.include_Declared_Value  ||  this.formModel.known_Shipper != this.pickupAlert.known_Shipper
      ||  this.formModel.must_Check_ID != this.pickupAlert.must_Check_ID || this.formModel.phone_Number != this.pickupAlert.phone_Number
      ||  this.formModel.special_Instruction != this.pickupAlert.special_Instruction ||  this.formModel.alert_Option != this.pickupAlert.alert_Option
      ||  this.formModel.alert_Option_Description != this.pickupAlert.alert_Option_Description ||  this.formModel.carrier_Name != this.pickupAlert.carrier_Name
      ||  this.formModel.carrier_Code != this.pickupAlert.carrier_Code
  }  
  return false;
}
showWarning(){
    const dialogRef = this.dialogService.showConfirmationPopup(Messages.WARNING_TITLE,Messages.SAVE_CHANGES);

    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) { }
    else if (result && result.clickedCancel) {
      const prevURL:string =  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
      this.router.navigateByUrl(prevURL);
    }
   });
}

public instructionChangehandler(event){
  this.formModel.special_Instruction = event;
}

public isEditable(fieldName) {
  if(this.isEditMode && fieldName) {
    return this.rulesService.shouldEditable(fieldName);
  }
  return this.isEditMode;
}

ngOnDestroy() {
  this.destroy$.next(true);
  this.destroy$.unsubscribe();
}

private enableRadioButtons()
{
     this.disable_alert_Option = this.isEditable('alert_Option');
     this.disable_known_Shipper = this.isEditable('known_Shipper');
     this.disable_include_Declared_Value = this.isEditable('include_Declared_Value');
     this.disable_must_Check_ID = this.isEditable('must_Check_ID');
}


}
