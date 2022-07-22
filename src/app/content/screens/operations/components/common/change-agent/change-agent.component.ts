import { Component, OnInit,ViewChildren, QueryList, } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { OperationsService }from 'src/app/services/operation.service' ;
import { UtilitiesService } from 'src/app/services/utilities.service';
import AuthService from 'src/app/services/auth.service';
import { ApplicationService } from 'src/app/services/application.service';
import {PhoneNumberComponent} from '../../../../../partials/components/phone-number/phone-number';
import {DropdownGridComponent} from '../../../../../partials/components/dropdown-grid/dropdown-grid.component';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { SectionMapping } from 'src/app/common/section-mapping';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-change-agent',
  templateUrl: './change-agent.component.html',
  styleUrls: ['./change-agent.component.scss']
})
export class ChangeAgentComponent implements OnInit {
  @ViewChildren(PhoneNumberComponent) inputPhoneChildren :QueryList<PhoneNumberComponent>;
  @ViewChildren(DropdownGridComponent) dropDownGridComponents: QueryList<DropdownGridComponent>;
  private tabID:any;
  private prevUrl:any;   
  private orderID:any;
  public tsApproveError:boolean;
  public phoneValid:boolean =true;
  public tsaapproved:boolean ;
  public headerLabel:String;
  private orderObj:any;
  public agents:any[];
  private agent:any;
  public agentHeaders:any[]= [['CODE','airport_Code'],['ADDRESS','address']];
  public selectedAgent:any;
  public isEditMode:boolean = false;
  public canEdit:boolean = false;
  public shouldSectionDisabled: boolean;
  public isUpdate:boolean = false;
  public formModel:any;
  constructor(private localStorageService: LocalStorageService, 
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private operationService:OperationsService,
              private utilitiesService : UtilitiesService,
              private dialogService : DialogService,
              private rulesService: BusinessRulesService) { }

  ngOnInit() {
     this.orderID = ApplicationService.instance.order_id
     this.tabID = this.activatedRoute.snapshot.paramMap.get('tabId') ;
     this.prevUrl = this.localStorageService.getItem(`${this.orderID}:navigateUrl`);
     this.headerLabel = (this.tabID=='PU')?'Pickup':'Delivery';
     this.getOrderFromLS();
     this.configModel();
     this.getAgent()
    // this.getPickupDeliveryAgents();
  }
 
configModel(){
 
  this.formModel =   {
  created_by: AuthService.getInstance().userId ,   
  delivery_Agent_Name:null,
  delivery_Agent_Phone: null,
  delivery_Contract_Number: null,  
  order_ID: this.orderID ,
  pickup_Agent_Name: null,
  pickup_Agent_Phone: null,
  pickup_Contract_Number:null,
  pickup_Delivery_ID: 0,
  transfer_Agent_Name:null,
  transfer_Agent_Phone: null,
  transfer_Contract_Number:null,
  routing_Agent_ID:null
  }
}
getOrderFromLS(){
 const order :any = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`);
 this.orderObj = JSON.parse(order);
 // console.log('this.orderObj  : ',this.orderObj);
}

getAgent(){
  this.operationService.getRoutingAgent( this.orderID).subscribe((result:any)=>{
      if(result){
         for(let item of result){
             if(this.tabID == 'PU' && item.pickup_Agent_Name != null ) {
                this.selectedAgent = {
                    address: item.pickup_Agent_Name,
                    contract_Number: item.pickup_Contract_Number,
                    phone: item.pickup_Agent_Phone
                }
                 this.formModel = item ;
                 this.agent = Object.assign({},item);
                 this.canEdit = true ;
                 this.isEditMode = false;
             }
             if(this.tabID == 'DEL' && item.delivery_Agent_Name != null){
               this.selectedAgent = {
                    address:    item.delivery_Agent_Name,
                    contract_Number: item.delivery_Contract_Number ,
                    phone: item.delivery_Agent_Phone
               }
                this.formModel  = item ;
                this.agent = Object.assign({},item);
                this.canEdit = true ;
                this.isEditMode = false;
             }
         }
         if(this.rulesService.shouldSectionDisabled(SectionMapping.CHANGE_ANGENT)) {
            this.shouldSectionDisabled = true;
            this.canEdit = true;
            this.isEditMode = false;
         }
      }
  });
}

getPickupDeliveryAgents(){
  const airCode:any = (this.tabID == 'PU')? this.orderObj.origin_Air_Code:this.orderObj.dest_Air_Code ;
  this.utilitiesService.getPickupDelieryAgents(airCode,this.tsaapproved).subscribe((result:any)=>{
    console.log('rsult : ',result);
    if(result && result.length==0){
      this.showResult();
      return false;
    }
    this.agents = result;
    this.isEditMode = true;
  });
}

handleRadioClick(value){
  //this.isEditMode = true;
  this.tsaapproved = value ;
  this.tsApproveError =false;
  this.selectedAgent= (this.selectedAgent)?this.selectedAgent:  null;
  this.agents=[];
  this.getPickupDeliveryAgents();
  console.log('tsaapproved  ',this.tsaapproved);
}

agentSelecthandler(event){
  console.log('event  :',event);
  this.selectedAgent = event;
  this.phoneValid = false;
  if(this.tabID == 'PU'){
      this.formModel.pickup_Contract_Number = this.selectedAgent.contract_Number;
      this.formModel.pickup_Agent_Name = this.selectedAgent.address
      this.formModel.pickup_Agent_Phone = this.selectedAgent.phone;
  } else {
      this.formModel.delivery_Contract_Number = this.selectedAgent.contract_Number;
      this.formModel.delivery_Agent_Name = this.selectedAgent.address;
      this.formModel.delivery_Agent_Phone = this.selectedAgent.phone;
  }
}
CellChangehandler(event){
  console.log('CellChangehandler  :',event);
}
isDirty(){
 
  if(this.tabID=='PU'){
      if(this.agent==undefined){
        return this.formModel.pickup_Agent_Name != null || this.formModel.pickup_Contract_Number != null || this.formModel.pickup_Agent_Phone != null
      }else {
        return this.formModel.pickup_Agent_Name !=  this.agent.pickup_Agent_Name  || this.formModel.pickup_Contract_Number != this.agent.pickup_Contract_Number  || this.formModel.pickup_Agent_Phone != this.agent.pickup_Agent_Phone ; 
      }
  }else {
      if(this.agent==undefined){
          return this.formModel.delivery_Agent_Name != null || this.formModel.delivery_Contract_Number != null || this.formModel.delivery_Agent_Phone != null
      }else{
        return this.formModel.delivery_Agent_Name !=  this.agent.delivery_Agent_Name  || this.formModel.delivery_Contract_Number != this.agent.delivery_Contract_Number  || this.formModel.delivery_Agent_Phone != this.agent.delivery_Agent_Phone ; 
      }
  }
  return false;
}

showWarning(){
    this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE,Messages.SAVE_CHANGES)
    .afterClosed().subscribe(result => {
      if (result && result.clickedOkay) {
        this.saveBtnClickhandler(event, true);
      }
      else {
        this.router.navigateByUrl(this.prevUrl);
      }
    });
  }

validateInput(){
  let isValid = true;
  if (this.inputPhoneChildren) {
    console.log('this.inputTextChildren.toArray()   : ',this.inputPhoneChildren.toArray());
    for (let inputText of this.inputPhoneChildren.toArray()) {
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
  if(this.selectedAgent == undefined ){
    isValid = false;
    this.tsApproveError = false;
  }
/*  if(this.selectedAgent && this.selectedAgent.phone==''){
    isValid = false;
    this.phoneValid = false;
  }*/
  if(this.tsaapproved ==undefined){
    this.tsApproveError =true;
    isValid = false;
  }  
  console.log('isValid  ',isValid);
  return isValid ;
}

/*-----------------------*/
closeBtnClickhandler(event){
   if(this.isDirty()){
        this.showWarning();
    }
    else {
      this.router.navigateByUrl(this.prevUrl);
    }   
}

editBtnClickhandler(event){
   this.tsaapproved =undefined;
   this.canEdit =  false; 
   this.isUpdate =true;
  // this.selectedAgent=null;
   this.agents=[];
}

saveBtnClickhandler(event, closeClicked: boolean = false){
  if(!this.validateInput()){
    return false;
  }

 this.operationService.saveRoutingAgent(this.formModel).subscribe((result:any)=>{
    if(result.error){
      alert('Error - update order/routing/agent');
    }
    this.isEditMode = false;
    this.canEdit =true;
    this.agent = Object.assign({},result);
    this.formModel  = result ;

    if(closeClicked) {
      this.router.navigateByUrl(this.prevUrl);
    }
 });
}

updateBtnClickhandler(event){
 if(!this.validateInput()){
  return false;
 } 
 this.operationService.updateRoutingAgent(this.formModel).subscribe((result:any)=>{
    if(result.error){
      alert('Error - update order/routing/agent');
    }
    this.isEditMode = false;
    this.canEdit =true;
    this.agent = Object.assign({},result);
    this.formModel  = result ;
  });
}
/*----------------------------*/
showResult(){
  const dialogRef = this.dialogService.showInfoPopup(Messages.SEARCH_TITLE,Messages.NO_AGENT);

  dialogRef.afterClosed().subscribe(result => {
  if (result && result.clickedOkay) {
    
    }
  });
}
}
