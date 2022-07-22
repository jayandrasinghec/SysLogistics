import { Component, OnInit, Input,ViewChildren, QueryList} from '@angular/core';
import AuthService from '../../../../../../../services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import  {OperationsService} from 'src/app/services/operation.service';
import {InputTextComponent} from '../../../../../../partials/components/inputtext/inputtext.component';
import { Messages } from 'src/app/common/Messages';
import * as _ from 'lodash';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';

@Component({
  selector: 'app-truckalert',
  templateUrl: './truckalert.component.html',
  styleUrls: ['./truckalert.component.css']
})
export class TruckalertComponent implements OnInit {
@ViewChildren(InputTextComponent) inputTextChildren: QueryList<InputTextComponent>;      
@Input() order: any ;
private orderId:any;
public isEditMode:boolean = true;
public isLoad_date_Editable: boolean = true;
public isDeliver_date_Editable: boolean = true;
public formModel:any;
private comapareFormModel: any;
public isLoadDateValid:boolean;
public isDelDateValid:boolean;
public minDate = new Date();
public isUpdate:boolean = false;
private errorMessage:any;
public puCommentValid:boolean = true;
public delCommentValid:boolean = true;
private truckAlert:any;
private isSendAPI:boolean=false;
  constructor(private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService, 
               private router: Router,
               private operationService: OperationsService,
               public dialogService: DialogService,
               private rulesService: BusinessRulesService) { }

  ngOnInit() {
    this.orderId = this.activatedRoute.snapshot.paramMap.get('orderid');
    this.configModel();
    this.getTruckAlert();
    
  }
  
configModel(){
     this.formModel =   {
        created_By: AuthService.getInstance().userId,
        delivery_Comment: null,
        delivery_Time_From : this.order.delivery_Time_From,
        delivery_Time_To: this.order.delivery_Time_To,
        delivery_Date:this.order.delivery_Date,
        load_Time_From: this.order.load_Time_From,
        load_Time_To:this.order.load_Time_To,
        load_Date:this.order.load_Date,
        modified_By: 0,   
        order_ID: this.orderId,
        pickup_Comment: null
    }
    this.comapareFormModel = Object.assign({}, this.formModel);
  }

  getTruckAlert(){
    this.operationService.getTruckAlert(this.orderId).subscribe((result:any)=>{
      console.log('getTruckAlert   ',result);
      if(result){
        this.formModel = result;
        this.comapareFormModel = Object.assign({}, this.formModel);
        this.truckAlert = Object.assign({},result);
        if(result.created_Date != null){
           this.isEditMode = false ;
           this.isUpdate = true;
        }
      }
      this.isLoad_date_Editable = this.isEditable('load_Date');
      this.isDeliver_date_Editable = this.isEditable('delivery_Date');
    });
  }

getDate() {

}

dateChangehandler(event,type){
 this.formModel[type] = this.convert(event.value) ;
}

timeFromChangehandler(event,type){
  this.formModel[type] = event;
}

timeToChangehandler(event,type){
  this.formModel[type] = event;
}

/*------------------------*/
closeBtnClickHandler(event){
  if(this.isDirty()){
    this.dialogService.showConfirmationPopup(Messages.WARNING_TITLE, Messages.SAVE_CHANGES)
    .afterClosed().subscribe(result => {
      if (result && result.clickedOkay) {
        if(this.isUpdate){
          this.updateBtnClickHandler(event);
        }else{
          this.saveBtnClickHandler(event);
        }
      }
      else {
        this.navigateToPrevious();
      }
   });
  }
  else {
    this.navigateToPrevious();
  }
}

private navigateToPrevious() {
  const prevURL:string =  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
  this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
  this.router.navigateByUrl(prevURL);
}

editBtnClickHandler(event){
    this.isEditMode = true;
    this.isLoad_date_Editable = this.isEditable('load_Date');
    this.isDeliver_date_Editable = this.isEditable('delivery_Date');    
    //this.isUpdate = true;
}

saveBtnClickHandler(event){
 if(!this.validateInput() || this.isSendAPI){
    return false;
  }   
  this.delCommentValid =true;
  this.puCommentValid = true;
  this.isDelDateValid =  true;
  this.isLoadDateValid= true;
  this.isSendAPI = true;
  this.operationService.saveTruckAlert(this.formModel).subscribe((result:any)=>{
    if(result.error){
      alert('Error - save truck/alert')
    }
    this.isSendAPI = false;
    this.isEditMode = false;
    this.isUpdate = true;
    this.formModel = result;
    this.truckAlert = Object.assign({},result);
    this.comapareFormModel = Object.assign({}, this.formModel);
    this.isLoad_date_Editable = this.isEditable('load_Date');
    this.isDeliver_date_Editable = this.isEditable('delivery_Date');
  });
}

updateBtnClickHandler(event){
 if(!this.validateInput() || this.isSendAPI){
    return false;
  }  

  this.delCommentValid =true;
  this.puCommentValid = true;
  this.isDelDateValid =  true;
  this.isLoadDateValid= true;
  this.isSendAPI = true;

  this.operationService.updateTruckAlert(this.formModel).subscribe((result:any)=>{
    if(result.error){
      alert('Error - update truck/alert');
    }
    this.isSendAPI = false;
    this.isEditMode = false;
    this.isLoad_date_Editable = false;
    this.isDeliver_date_Editable = false;
    // this.isUpdate = false;
    this.formModel = result;
    this.truckAlert = Object.assign({},result);
    this.comapareFormModel = Object.assign({}, this.formModel);
    this.isLoad_date_Editable = this.isEditable('load_Date');
    this.isDeliver_date_Editable = this.isEditable('delivery_Date');
  });
}

convert(date) {
  const mnth = ("0" + (date._i.month + 1)).slice(-2);
  const day = ("0" + date._i.date).slice(-2);
  return [date._i.year, mnth, day].join("-");
}

validateInput(){
  let isValid = true;
  
  if (this.inputTextChildren) {
    console.log('this.inputTextChildren.toArray()   : ',this.inputTextChildren.toArray());
    for (let inputText of this.inputTextChildren.toArray()) {
      if(!inputText.validateInputElement())
      {
        isValid = false;
      }
    }
  }
  if ( this.formModel.load_Date == (undefined || null) ){
    isValid = this.isLoadDateValid = false;
  } 
  else if (this.formModel.delivery_Date == (undefined || null)) {
      isValid =  this.isDelDateValid = false;
  }
  if(this.formModel.load_Date > this.formModel.delivery_Date){
    this.errorMessage = Messages.ERROR_DELIVER_DATE;
      isValid =  false;
  }
  if(this.formModel.load_Time_From > this.formModel.load_Time_To){
      this.errorMessage = Messages.ERROR_LOAD_TIME;
      isValid =  false;
  }
  if( this.formModel.delivery_Time_From > this.formModel.delivery_Time_To){
      this.errorMessage = Messages.ERROR_DELIVER_TIME;
      isValid =  false;
  }
  if(!isValid  && this.errorMessage && this.errorMessage.length>0){
    this.dialogService.showInfoPopup(Messages.WARNING_TITLE, this.errorMessage);
  }
  if(this.formModel.delivery_Comment== null || this.formModel.delivery_Comment==""){
       isValid =this.delCommentValid =   false;
  }  
  if(this.formModel.pickup_Comment == null || this.formModel.pickup_Comment =="" ){
      isValid = this.puCommentValid =   false;
  } 
  return isValid ;
}

commentChangeHander(event, commentField){
  this.formModel[commentField] = event;
}

isDirty(){
  console.log('isDirty  : ' , _.isEqual(this.comapareFormModel, this.formModel));
  return !_.isEqual(this.comapareFormModel, this.formModel);
}

isEditable(fieldName) {
  if(this.isEditMode) {
    return this.rulesService.shouldEditable(fieldName);
  }
  return this.isEditMode;
}

}
