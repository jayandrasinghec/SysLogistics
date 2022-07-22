import { Component, OnInit, Input,ViewChildren, QueryList,Output ,EventEmitter,OnChanges,ChangeDetectorRef} from '@angular/core';
import AuthService from '../../../../../../../services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import  {OperationsService} from 'src/app/services/operation.service';
import {InputTextComponent} from '../../../../../../partials/components/inputtext/inputtext.component';
import {DropdownGridComponent} from '../../../../../../partials/components/dropdown-grid/dropdown-grid.component';
import {UtilsService} from 'src/app/services/Utils.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-routingalert',
  templateUrl: './routingalert.component.html',
  styleUrls: ['./routingalert.component.css']
})
export class RoutingalertComponent implements OnInit,OnChanges {
  @ViewChildren(InputTextComponent) inputTextChildren: QueryList<InputTextComponent>;       
@ViewChildren(DropdownGridComponent) dropDownGridComponents: QueryList<DropdownGridComponent>;
  @Input() order: any ;
  @Input() carriersList:any;
  @Input() navIndex:any;
  
  @Output() routingAlertEvent: EventEmitter <any> = new EventEmitter();
  private orderId:any;
  public formModel:any;
  public routingAlerts:any=[];
  private refRoutingAlerts:any=[]; // using for comparing alerts if data has changed or not
  public isEditMode:boolean=true;
  public isUpdate:boolean=true;
  public ddCarriersHeaders:any[] =[['CODE','carrierCode'],['NAME','carrierName']];

  public ddAirBillHeaders:any[] =[['CODE','carrier_Code'],['NAME','carrier_Name']];
  public ddAirBillsList:any[]=[];
  public selectedAirBill:any;

  
  public ddService_JOEY_Headers:any[] =[["Code","service_level_code"],["Description","service_level_description"]];
  public ddService_JOEYList:any[]=[];
  public selectedService_JOEY:any;

  public ddService_FAX_Headers:any[] =[['CODE','carrier_Code'],['NAME','carrier_Name']];
  public ddService_FAXList:any[]=[];
  public selectedService_FAX:any;

  public spclCommentValid:boolean =true;
  public selectedCarrier:any;
  public disableNewBtn : boolean = true;
  private isCarrierSelected:boolean = false;
  constructor(private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService, 
               private router: Router,
               private operationService: OperationsService,
               private dialogService : DialogService,
                private cdr: ChangeDetectorRef,
                private utilsService:UtilsService) { }

  ngOnInit() {
    this.orderId = this.activatedRoute.snapshot.paramMap.get('orderid') ;    
    this.configModel();
    this.getAirBills();
   // this.getServiceLevel_JOEY();
   // this.getServiceLevel_FAX();
    this.getRoutingAlert();
  }
  ngOnChanges(changes) {
    if (changes.hasOwnProperty(`navIndex`) && changes[`navIndex`][`currentValue`] !== null  && changes[`navIndex`][`currentValue`] !== undefined ) {
      const index:any = changes[`navIndex`][`currentValue`];
     // console.log('navIndex ', index);
     //  console.log('this.routingAlerts ', this.routingAlerts);
      if(this.routingAlerts&& this.routingAlerts.length>0){
         this.formModel = this.routingAlerts[index];
         //this.formModel.drop_Time = this.updateDropTime(this.formModel.drop_Time);
         // this.isEditMode =true ;
         //this.isUpdate = true;
         if(this.formModel.created_Date != null){
           this.isEditMode =false ;
           this.isUpdate = false;
           this.selectedCarrier =  this.formModel.carrier_Name;
           this.updateServiceLavel(this.formModel.carrier_Code);
         }
      }     
    }   

  }
  configModel(){
     this.formModel =   {
        created_By: AuthService.getInstance().userId ,  
        airbill_Type: null,
        cap_Number : null ,
        carrier_Code:null,
        carrier_Name:null,
        commodity_Code:null,
        dest_Air_Code:null,
        dest_Air_Code_Final:null,
        drop_Time:null,
        email_Address:null,
        final_Destination:null,
        flight_Number_Final:null,
        flight_Number_Origin:null,
        master_Bill_Number:null,
        nature_Quantity_Goods:null,
        order_ID: this.orderId,
        origin_Air_Code :null,
        origin_Air_Code_Final:null,
        service_Level_Fax:null,
        service_Level_Shoair:null,
        special_Instruction:null,
        statusCode:null
           
    }
  }
  getAirBills(){
   /* this.operationService.getServiceFailure( this.orderId).subscribe((response:any)=>{
      console.log('getServiceFailure response', response  );
    })*/
    this.operationService.getAirBills( this.orderId).subscribe((response:any)=>{
      this.ddAirBillsList = response ;
    });
  }
 
 getCarrierServiceLevels(tariff_ID:any){
    this.operationService.getCarrierServiceLevels(tariff_ID).subscribe((response:any)=>{
      if(response.error){
        alert('Error - get utilities/carrierservicelevels');
      }
    //  console.log('getCarrierServiceLevels', response);      
      this.ddService_JOEYList  = response.filter(item=> item.service_level_description!="..." &&  item.service_level_code!= "...");
      if(this.formModel && this.formModel.service_Level_Shoair != null){
        const currentServiceLevel:any = this.ddService_JOEYList.find(item=> item.service_level_code == this.formModel.service_Level_Shoair);
        this.selectedService_JOEY = (currentServiceLevel)?  currentServiceLevel.service_level_code:'';
     }
   });
  }
 
  getRoutingAlert(){
    this.operationService.getRoutingAlert(this.orderId).subscribe((result:any)=>{
     // console.log('getRoutingAgent   ',result);
      if(result && result.length>0){
        this.formModel = result[0];
       // this.formModel.drop_Time = this.updateDropTime(this.formModel.drop_Time);       
        this.routingAlerts =  result;
        this.refRoutingAlerts = this.utilsService.getCloneofArray(this.routingAlerts); // cloning the array for refference
        this.routingAlertEvent.emit({alerts:this.routingAlerts,index:0});
        this.checkAndUpdateNewButton();
      //  console.log('this.formModel    ',this.formModel ,this.routingAlerts);
        if(this.formModel.created_Date != null){
           this.isEditMode =false ;
           this.isUpdate = false;
           this.selectedCarrier =  this.formModel.carrier_Name;
           this.updateServiceLavel(this.formModel.carrier_Code);
        }       
      }
    });
  }
  checkAndUpdateNewButton(){
    if(this.carriersList &&  this.carriersList.length>0 && this.routingAlerts && this.routingAlerts.length>0 ){
       for(var item of this.carriersList)
        {
            const found:any = this.routingAlerts.find(alert => alert.carrier_Code == item.carrierCode );
            if(found==undefined){
              this.disableNewBtn = false;
              break;
            }
        }
    }
  }
  updateDropTime(Time:any){
               
              switch(Time.length){
                case 4:
                break;
                case 3:
                  Time = `0${Time}`
                break;
                case 2:
                  Time = `00${Time}`
                break;
                case 1:
                  Time = `000${Time}`
                break;
              }
          return Time;
  }
  updateServiceLavel(carrierCode:any){
    const carrier:any = this.carriersList.find(item=> item.carrierCode == carrierCode);
    const tarrifId:any = carrier.tariffId;
    this.getCarrierServiceLevels(tarrifId);
  }
  /*-------------------------------*/
  emailChangehandler(event){
    
  }
  ddAirBillSelecthandler(event){

  }
 ddCarrierSelecthandler(event){
     // console.log(event);
      if(this.routingAlerts && this.routingAlerts.length>0){
          const found:any = this.routingAlerts.find(item=> item.carrier_Code == event.carrierCode );
          if(found){
             this.selectedCarrier = null;     
            this.formModel.carrier_Code=null;
            this.formModel.carrier_Name=null;
            this.isCarrierSelected = true;
            this.showMessage();            
          }
          else{
            this.isCarrierSelected = false;
            this.formModel.carrier_Code = event.carrierCode;
            this.formModel.carrier_Name = event.carrierName;
             this.getCarrierServiceLevels(event.tariffId);  
           }
      }else{
         this.isCarrierSelected = false;
         this.formModel.carrier_Code = event.carrierCode;
         this.formModel.carrier_Name = event.carrierName;
          this.getCarrierServiceLevels(event.tariffId);  
      }
  }

  ddServiceJOEYSelecthandler(event){
    this.formModel.service_Level_Shoair = event.service_level_code;
  }
  
  modelChangehandler(event,type){
    this.formModel[type] = event;
  }

  saveBtnClickhandler(event){
   // console.log('saveBtnClickhandler   ', this.formModel);
   if(!this.validateInput()){
      return false;
    } 
    this.formModel.statusCode = 'I';
    this.formModel.origin_Air_Code =    this.order.origin_Air_Code;
    this.formModel.dest_Air_Code =    this.order.dest_Air_Code;
    this.operationService.saveRoutingAlert([this.formModel]).subscribe((response:any)=>{
      if(response.error){ 
        alert('Error - save routing/alert');
        return false;
      }
      this.isEditMode = false;
      this.isUpdate = false;
      //this.routingAlerts.push(response);
      this.routingAlerts[this.navIndex] = response[0];
      this.refRoutingAlerts = this.utilsService.getCloneofArray(this.routingAlerts); 
     // console.log('this.routingAlerts  ',this.routingAlerts);
     // this.routingAlertEvent.emit(this.routingAlerts);
      this.routingAlertEvent.emit({alerts:this.routingAlerts,index:this.navIndex});
      this.checkAndUpdateNewButton();
     // console.log('saveRoutingAlert  ',response);

    });
  }

  updateBtnClickhandler(event){
   if(!this.validateInput()){
      return false;
    } 
    this.formModel.statusCode = 'U';
    this.operationService.updateRoutingAlert(this.formModel).subscribe((response:any)=>{
      if(response.error){ 
        alert('Error - update routing/alert')
      }
      this.routingAlerts[this.navIndex] = response;
      this.refRoutingAlerts = this.utilsService.getCloneofArray(this.routingAlerts); 
      this.isEditMode = false; 
      this.isUpdate = false;    
     });
   }
   editBtnClickhandler(event){
    if(!this.isEditMode){
        this.isEditMode =true;
      }
   }
  newRoutingBtnClickhandler(event){
     this.disableNewBtn = true;
     this.isEditMode =  true;
     this.isUpdate = true;
     this.selectedCarrier = null;
     this.selectedService_JOEY = null;
     this.configModel();
      this.routingAlerts.push(this.formModel);
     this.routingAlertEvent.emit({alerts:this.routingAlerts,index:this.navIndex+1});
  }
  closeBtnClickhandler(event){
   if(this.isDirty()){
    this.showWarning();
    return;
  }
  const prevURL:string =  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
  this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
  this.router.navigateByUrl(prevURL);

  }
isDirty(){
  let isValid:boolean = false;
  if(this.routingAlerts.length <= 0){
    isValid = this.isdirtyModel(this.formModel);
  }else{
    for(let index in this.routingAlerts){
       let model:any = this.routingAlerts[index];
       if( model.created_Date == null){
        isValid = this.isdirtyModel(model);
       }else{
        let refModel:any = this.refRoutingAlerts[index];
        isValid = this.dirtyByCompareModel(model,refModel);
       }       
       if(isValid){ 
         break;
       }
    }
  }
  return isValid;
}
isdirtyModel(model:any){
  if(model && model != null){
    return model.master_Bill_Number != null &&  model.master_Bill_Number != '' ||
           model.cap_Number != null &&  model.cap_Number != '' ||
           model.carrier_Code != null ||
           model.carrier_Name != null ||
           model.commodity_Code != null  &&  model.commodity_Code != ''||
           model.service_Level_Shoair != null  ||
           model.flight_Number_Origin != null &&  model.flight_Number_Origin != '' ||
           model.final_Destination != null &&  model.final_Destination != '' ||
           model.special_Instruction != null &&  model.special_Instruction != '' ||
           model.airbill_Type != null && model.airbill_Type != ''  ||                 
           model.dest_Air_Code_Final != null &&  model.dest_Air_Code_Final !=''||
           model.drop_Time != null &&  model.drop_Time != '' ||
           model.email_Address != null &&  model.email_Address !='' ||
           model.flight_Number_Final != null &&  model.flight_Number_Final != '' ||
           model.nature_Quantity_Goods != null &&  model.nature_Quantity_Goods !=''  ||
           model.origin_Air_Code_Final != null &&  model.origin_Air_Code_Final !=''
  }
  return false;
}
dirtyByCompareModel(model:any,refModel:any){ 
  if(model && refModel){
      return model.master_Bill_Number != refModel.master_Bill_Number  ||
                    model.cap_Number  != refModel.cap_Number  ||
                  model.carrier_Code  != refModel.carrier_Code ||
                  model.carrier_Name  != refModel.carrier_Name ||
                model.commodity_Code  != refModel.commodity_Code||
          model.service_Level_Shoair  != refModel.service_Level_Shoair  ||
           model.flight_Number_Origin != refModel.flight_Number_Origin ||
              model.final_Destination !=   refModel.final_Destination ||
            model.special_Instruction != refModel.special_Instruction ||
                   model.airbill_Type != refModel.airbill_Type ||                 
            model.dest_Air_Code_Final != refModel.dest_Air_Code_Final ||
                      model.drop_Time != refModel.drop_Time ||
                  model.email_Address != refModel.email_Address ||
            model.flight_Number_Final != refModel.flight_Number_Final ||
          model.nature_Quantity_Goods != refModel.nature_Quantity_Goods  ||
          model.origin_Air_Code_Final != refModel.origin_Air_Code_Final
  }
}
validateInput(){
  let isValid = true;
  
  if (this.inputTextChildren) {
    //console.log('this.inputTextChildren.toArray()   : ',this.inputTextChildren.toArray());
    for (let inputText of this.inputTextChildren.toArray()) {
      if(!inputText.validateInputElement())
      {
        isValid = false;
      }
    }
  }
  // console.log('isValid1  ',isValid);
  if (this.dropDownGridComponents) {
    // console.log('this.dropDownGridComponents.toArray()   : ',this.dropDownGridComponents.toArray());
    for (let dropdown of this.dropDownGridComponents.toArray()) {
      if(!dropdown.validateInputElement())
      {
        isValid = false;
      }
    }
  } 
  if(this.formModel.special_Instruction == null || this.formModel.special_Instruction == ''){
    this.spclCommentValid = false;
    isValid = false;
  }
 if( this.isCarrierSelected == true && this.formModel.carrier_Code == null &&  this.formModel.carrier_Name == null){
    this.showMessage();
    isValid = false;
  }  
 // console.log('isValid2  ',isValid);
  return isValid ;
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
 showMessage(){
    const _owner:any = this;
    const dialogRef = this.dialogService.showInfoPopup(Messages.WARNING_TITLE,Messages.CARRIER_CODE_IN_USE);
    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {}});
 }
 changeSpecialinstructions(event){
  if( this.formModel.special_Instruction!='' && this.formModel.special_Instruction!=null ){
    this.spclCommentValid =true;
  }
 }

 instructionChangehandler(event){
  this.formModel.special_Instruction = event;
  if( this.formModel.special_Instruction!='' && this.formModel.special_Instruction!=null )
  {
    this.spclCommentValid =true;
  }
 }

}
