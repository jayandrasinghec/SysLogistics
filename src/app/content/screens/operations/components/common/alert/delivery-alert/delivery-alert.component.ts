import {  Component,  OnInit,  Input,  HostBinding,ViewChildren, QueryList,  OnDestroy,  Output,  ViewEncapsulation,  HostListener,  ViewChild,  OnChanges,  EventEmitter,  SimpleChanges } from '@angular/core';
 ;
import AuthService from '../../../../../../../services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import  {OperationsService} from 'src/app/services/operation.service';
import {PhoneNumberComponent} from '../../../../../../partials/components/phone-number/phone-number';
 import {InputTextComponent} from '../../../../../../partials/components/inputtext/inputtext.component';
import {DropdownGridComponent} from '../../../../../../partials/components/dropdown-grid/dropdown-grid.component'; 
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-delivery-alert',
  templateUrl: './delivery-alert.component.html',
  styleUrls: ['./delivery-alert.component.css']
})
export class DeliveryAlertComponent implements OnInit {
@ViewChildren(PhoneNumberComponent) inputPhoneChildren :QueryList<PhoneNumberComponent>;
@ViewChildren(DropdownGridComponent) dropDownGridComponents: QueryList<DropdownGridComponent>;
@ViewChildren(InputTextComponent) inputTextChildren: QueryList<InputTextComponent>;   
@Input() order: any ;
@Input() type: any ;
@Input() alertOptions:any;
@Input() routingAgent:any;
@Input() carriersList:any; 
private orderId:any;
public formModel:any;
public ddCarriersHeaders:any[] =[['CODE','carrierCode'],['NAME','carrierName']];
public editDisabled:boolean = true;
public isUpdate:boolean = false;
public isEditMode:boolean = true;
public is_Editable_AlertOption:boolean=true;
public is_Editable_IncludeDeclaredValue:boolean=true;
public selectedCarrier:any;
public isSubmit:boolean = false;
public delivery_Agent_Name:any;
public deliveryAlert:any;
  constructor(private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService, 
               private router: Router,
               private operationService: OperationsService,
               private dialogService : DialogService,
               private rulesService: BusinessRulesService ) { }

  ngOnInit() {
     this.orderId = this.activatedRoute.snapshot.paramMap.get('orderid') ;    
    this.configModel();
    this.getPickupDeliveryAlert();
  }
  ngOnChanges(changes)
  {
   // console.log('changes  ', changes);
    if(changes && changes.routingAgent &&   changes.routingAgent.currentValue !== undefined && changes.routingAgent.currentValue !==  changes.routingAgent.previousValue ) {
        const routingAgents = changes.routingAgent.currentValue;
        for(let item of routingAgents){
          if(item.delivery_Agent_Name != null){
            this.delivery_Agent_Name = item.delivery_Agent_Name;
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
          cross_Declared_Value: 0,         
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
    let deliveryAlert:any;
    this.operationService.getPickupDeliveryAlert(this.orderId,this.type).subscribe((result:any)=>{
      console.log('getPickupDeliveryAlert  ',result);
      if(result.error){
        alert('Error - get pickupdelivery/alert');
      }
      if(result && result.pickupDeliveryAlert && result.pickupDeliveryAlert.length>0){

           const deliveryAlert:any = result.pickupDeliveryAlert.find(item => item.alert_Type =='DEL');
           if( deliveryAlert ){
              this.deliveryAlert = Object.assign({},deliveryAlert);
              this.formModel = deliveryAlert ;
              this.editDisabled =false;
              this.isEditMode = false;
              this.selectedCarrier = this.formModel.carrier_Name;
              this.isUpdate = true;
           }           
      }
      this.is_Editable_AlertOption = this.isEditable('alert_Option');
      this.is_Editable_IncludeDeclaredValue = this.isEditable('include_Declared_Value');
    });
  }
  

  changeModel(event :any,type : any)
  {
    this.formModel[type]= event;
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

}
emailBtnClickhandler(event){

}
editBtnClickhandler(event){
   this.editDisabled =true;
   this.isEditMode  =true;
   this.is_Editable_AlertOption = this.isEditable('alert_Option');
   this.is_Editable_IncludeDeclaredValue = this.isEditable('include_Declared_Value');
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

    this.editDisabled =false;
    this.isUpdate = true;
    this.isEditMode  =false;
    this.is_Editable_AlertOption = this.isEditable('alert_Option');
    this.is_Editable_IncludeDeclaredValue = this.isEditable('include_Declared_Value');
    this.formModel = result;
    this.deliveryAlert = Object.assign({},result);
  });
}
updateBtnClickhandler(event){
    this.isSubmit =true;
    if(!this.validateInput()){
      return false;
    } 
   this.operationService.updatePickupDeliveryAlert(this.formModel).subscribe((result:any)=>{
    if(result.error){
      alert('Error - Update pickupdelivery/alert');
    }
    this.editDisabled =false;
    // this.isUpdate = false;
    this.isEditMode  =false;
    this.is_Editable_AlertOption = this.isEditable('alert_Option');
    this.is_Editable_IncludeDeclaredValue = this.isEditable('include_Declared_Value');
    this.formModel = result;
    this.deliveryAlert = Object.assign({},result);

  });
}
validateInput(){
  let isValid = true;
  if (this.inputPhoneChildren) {
    console.log('this.inputPhoneChildren.toArray()   : ',this.inputPhoneChildren.toArray());
    for (let inputText of this.inputPhoneChildren.toArray()) {
      if(!inputText.validateInputElement())
      {
        isValid = false;
      }
    }
  }
  if (this.inputTextChildren) {
    console.log('this.inputTextChildren.toArray()   : ',this.inputTextChildren.toArray());
    for (let inputText of this.inputTextChildren.toArray()) {
      if(!inputText.validateInputElement())
      {
        isValid = false;
      }
    }
  }
  if (this.dropDownGridComponents) {
     console.log('this.dropDownGridComponents.toArray()   : ',this.dropDownGridComponents.toArray());
    for (let dropdown of this.dropDownGridComponents.toArray()) {
      if(!dropdown.validateInputElement())
      {
        isValid = false;
      }
    }
  } 
  if(this.formModel.alert_Option == null || this.formModel.special_Instruction == null || this.formModel.special_Instruction == '' ){
   isValid = false;
  }
  console.log('isValid  ',isValid);
  return isValid ;
}
isDirty(){
  if(this.deliveryAlert== undefined){    
      return (this.formModel.cross_Declared_Value != null && this.formModel.cross_Declared_Value != "") 
      || (this.formModel.fax_Number != null && this.formModel.fax_Number != "") 
      || this.formModel.include_Declared_Value != null
      || (this.formModel.phone_Number != null && this.formModel.phone_Number != "")
      ||  (this.formModel.special_Instruction != null &&  this.formModel.special_Instruction != "" ) 
      ||  this.formModel.alert_Option != null
      ||  this.formModel.alert_Option_Description != null ||  this.formModel.carrier_Name != null
      ||  this.formModel.carrier_Code != null
   
  }else{
      return this.formModel.cross_Declared_Value !=  this.deliveryAlert.cross_Declared_Value 
      || this.formModel.fax_Number != this.deliveryAlert.fax_Number 
      || this.formModel.include_Declared_Value != this.deliveryAlert.include_Declared_Value   
      || this.formModel.phone_Number != this.deliveryAlert.phone_Number
      ||  this.formModel.special_Instruction != this.deliveryAlert.special_Instruction 
      ||  this.formModel.alert_Option != this.deliveryAlert.alert_Option
      ||  this.formModel.alert_Option_Description != this.deliveryAlert.alert_Option_Description 
      ||  this.formModel.carrier_Name != this.deliveryAlert.carrier_Name
      ||  this.formModel.carrier_Code != this.deliveryAlert.carrier_Code
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

instructionChangehandler(event){
  this.formModel.special_Instruction = event;
}

public isEditable(fieldName) {
  if(this.isEditMode && fieldName) {
    return this.rulesService.shouldEditable(fieldName);
  }
  return this.isEditMode;
}


}
