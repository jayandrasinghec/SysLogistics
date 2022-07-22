import { Component, OnInit,ViewChildren,QueryList } from '@angular/core';
import AuthService from '../../../../../../services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import { InputTextComponent } from 'src/app/content/partials/components/inputtext/inputtext.component';
import  {OperationsService} from 'src/app/services/operation.service';
import { Messages } from 'src/app/common/Messages';
import * as _ from 'lodash';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {
  @ViewChildren(InputTextComponent) inputTextComponent: QueryList<InputTextComponent>;
  options:any;
  labelType:string;
  isContainerLabel:boolean  ;
  radioBtnSelected:boolean ;
  containerModel:any;
  awbModel:any;
  compareContainerModel: any;
  compareAwbModel: any;
  tabID:any;
  orderID:any;
  orderObj:any;
  submitted:boolean = false;
  canEditContainer:boolean = true;
  canEditAWB:boolean = true;
  containerEditDisabled:boolean = true;
  awbEditDisabled:boolean = true;
  isUpdate:boolean =false;
  private labels:any[] =[];
  txtAreaValid:boolean = true;
  constructor(private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService, 
               private router: Router,
               private operationService: OperationsService,
               private dialogService : DialogService) { }

  ngOnInit() {
    this.labelType = 'Container';
    this.isContainerLabel  =true ;
    this.radioBtnSelected = true;
     this.getOrderFromLS();
     this.configModels();
    this.getLabels();
   
   
  }
getLabels(){
  console.log('this.orderID  ',ApplicationService.instance.order_id);
   this.operationService.getLabel(ApplicationService.instance.order_id).subscribe((result:any)=>{
       if(result != null  ){
         if(result.length ==0 ){
           this.labelType= 'Container';
         }
         else{
            this.populateLabels(result)
         }
       
      } 
      console.log('getLabel result  : ',result);
  });
}
populateLabels(labels:any){
  this.labels = labels;
  for(let item of labels){
   if(item.label_Type =='Container'){
      this.isContainerLabel = true;  
      this.containerModel = Object.assign({},item);  
      this.compareContainerModel = Object.assign({},item);
      this.labelType =  item.label_Type;
      this.canEditContainer = false;
      this.containerEditDisabled = false;   
    } else {
     this.isContainerLabel = false;
     this.awbModel = Object.assign({},item);
     this.compareAwbModel = Object.assign({},item);    
     this.labelType = item.label_Type;
     this.canEditAWB = false;
     this.awbEditDisabled = false;  
    }
  }
  this.radioBtnSelected =true;     
}
getOrderFromLS(){
 this.tabID = this.activatedRoute.snapshot.paramMap.get('tabId') ;
 this.orderID = this.activatedRoute.snapshot.paramMap.get('orderid') ;
 //ApplicationService.instance.order_id = this.orderID;
 const order :any = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`);
 this.orderObj = JSON.parse(order);
}

  configModels(){
    this.containerModel = {
      container_Number:'',
      created_By:AuthService.getInstance().userId,
      destination:null,
      final_Destination:null ,
      hawb_No:null,
      label_Instructions:'',
      label_Type:'Container',
      mawb_No:null,
      order_ID:ApplicationService.instance.order_id  ,
      total_Pieces:this.orderObj.pieces
    }
     this.awbModel = {
      container_Number:null,
      created_By:AuthService.getInstance().userId,
      destination:null,
      final_Destination: this.orderObj.dest_Air_Code,
      hawb_No:null,
      label_Instructions:null,
      label_Type:'AWB',
      mawb_No:null,
      order_ID:ApplicationService.instance.order_id  ,
      total_Pieces:this.orderObj.pieces
    }

    this.compareContainerModel = Object.assign({},this.containerModel);
    this.compareAwbModel = Object.assign({},this.awbModel);
    
  }

  handleRadioClick(type:any) {
    this.submitted =false;
    this.radioBtnSelected = true;
    this.labelType = type;
    this.isContainerLabel = (type === 'Container') ? true : false;   
}
piecesChangehandler(event){
 this.containerModel.total_Pieces  =  event;
}

containerNumChangehandler(event){
 this.containerModel.container_Number  =  event;
}

finalDestinatoinChangehandler(event){
  this.awbModel.final_Destination  =  event;
}

hawbChangehandler(event){
  this.awbModel.hawb_No  =  event;
}

destinationChangehandler(event){
  this.awbModel.destination  =  event;
}

mawbChangehandler(event){
  this.awbModel.mawb_No  =  event;
}

instructionChange(event){
  this.txtAreaValid  = true;
  this.containerModel.label_Instructions = event;
}

saveBtnClickHandler(event, closeClicked:boolean = false){
    this.submitted = true;
    if(!this.validateIPElements()){
     return false;
    }
    const model:any = (this.labelType == 'Container')?this.containerModel:this.awbModel;
    if(!this.isUpdate){
      this.operationService.saveLabel(model).subscribe((result:any)=>{
          if(result.error){
            alert('Server error. Please try again');
          }
          if(closeClicked) {
            this.navigateToPrevious();
          }
          this.handleResponse(result);
          
      }); 
    }else{
         this.operationService.updateLabel(model).subscribe((result:any)=>{
          if(result.error){
            alert('Server error. Please try again');
          }
          if(closeClicked) {
            this.navigateToPrevious();
          }
          this.handleResponse(result);
      }); 
    }
  }

  handleResponse(result:any){
    if(result.label_Type =='Container'){
      this.isContainerLabel = true;  
      this.containerModel = result;  
      this.labelType =  result.label_Type;
      this.canEditContainer = false;
      this.containerEditDisabled = false; 
      this.compareContainerModel = Object.assign({},this.containerModel);  
    } else {
      this.isContainerLabel = false;
      this.awbModel = result;   
      this.labelType = result.label_Type;
      this.canEditAWB = false;
      this.awbEditDisabled = false;
      this.compareAwbModel = Object.assign({},this.compareAwbModel);
    }          
    const resFound:any = this.labels.find( item => item.label_Type == result.label_Type);
    if(resFound){
      const index =  this.labels.indexOf(resFound); 
      this.labels[index] = Object.assign({},result);;
    }else{
      this.labels.push(Object.assign({},result));
    }
  }

  editContainerBtnClickHandler(event){
    this.isUpdate = true;
    this.canEditContainer = true;
  }

  editAWBBtnClickHandler(event){
    this.isUpdate = true;
    this.canEditAWB = true;
  }

  previewBtnClickHandler(event){
  }

  private navigateToPrevious() {
    const prevURL:string =  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.router.navigateByUrl(prevURL);
  }

  closeClickHandler(event){
    if(this.isDirty()) {
      this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE,Messages.SAVE_CHANGES)
      .afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
          this.saveBtnClickHandler(event, true);
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

  validateIPElements() {
     let isFormValid : boolean = true; 
    if (this.inputTextComponent) {
      for (let textBox of this.inputTextComponent.toArray()) {
        if (!textBox.validateInputElement())  {
          isFormValid = false;
        }
      }
    }
    if(this.labelType == 'Container' &&
     (this.containerModel.label_Instructions ==null || this.containerModel.label_Instructions =="")){
        isFormValid = this.txtAreaValid = false;
    }

    return isFormValid;
  }

  private isDirty(){
    let isChanged:boolean = false;
    if(this.labelType.toLowerCase() === "container" && this.containerModel) {
      isChanged = !_.isEqual(this.compareContainerModel, this.containerModel);
    }
    else {
      if(this.awbModel) {
        isChanged = !_.isEqual(this.compareAwbModel, this.awbModel);
      }
    }
    return isChanged;  
  }
 
}