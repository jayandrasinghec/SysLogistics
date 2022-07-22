import { Component, OnInit, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { UtilsService } from 'src/app/services/Utils.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import { RoutingDetail } from 'src/app/core/models/routing-detail.model';
import { OperationsService } from 'src/app/services/operation.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import AuthService from 'src/app/services/auth.service';
import { InputTextComponent } from 'src/app/content/partials/components/inputtext/inputtext.component';
import { LoaderService } from 'src/app/services/loader.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { SectionMapping } from 'src/app/common/section-mapping';
import { BusinessRulesService } from 'src/app/services/business-rules.service';

@Component({
  selector: 'app-proof-of-pickup-or-delivery',
  templateUrl: './proof-of-pickup-or-delivery.component.html',
  styleUrls: ['./proof-of-pickup-or-delivery.component.scss']
})
export class ProofOfPickupOrDeliveryComponent implements OnInit {

  public type:any;
  private prevUrl:any;
  private destroy$ = new Subject();
  public orderID : any;
  public routingDetailModel : RoutingDetail;
  private authService : AuthService;
  public routingStatus : any = {};
  public routingStatusModel : any;
  public isCheckBoxValueChanged: any;
  public disableCheckBOx:boolean = true;
  public isRoutingDetailExist : boolean;
  public fileList:any[]= [];
  public manageFileList:any[]= [];
  private attachmentList:any[];
  public title : any;
  public minDate : any;
  public maxDate : any;
  public isDateValid:boolean = true;
  public shouldDisableSection: boolean;
  private routingLogs:any[]=[];
  private orderModel : BookingOrder;
  @Output() modelChange: EventEmitter<any> = new EventEmitter();
  @ViewChildren(InputTextComponent) inputTextComponent : QueryList<InputTextComponent>;

  constructor(
    private utilsService : UtilsService,
    private localStorageService : LocalStorageService,
    private router : Router,
    private dialogService : DialogService,
    private activatedRoute : ActivatedRoute,
    private operationService : OperationsService,
    private rulesService: BusinessRulesService) { 
      // this.orderID = ApplicationService.instance.order_id
  }

  ngOnInit() {
    this.authService = AuthService.getInstance();
    this.routingDetailModel = new RoutingDetail();
    this.orderID = ApplicationService.instance.order_id;
    this.type = this.activatedRoute.snapshot.paramMap.get('type');
    this.prevUrl = this.localStorageService.getItem(`${this.orderID}:${this.type}_navigateUrl`);
    this.title = this.type == 'POP' ? 'Pickup' : 'Delivery';

    if(this.type === "POP") {
      this.shouldDisableSection = this.rulesService.shouldSectionDisabled(SectionMapping.POP);
    }else {
      this.shouldDisableSection = this.rulesService.shouldSectionDisabled(SectionMapping.POD);
    }

    this.fetchData();
    this.getRoutingAttachment();
    this.configRoutingStatus();
    
  }

  ngOnDestroy(){
    this.destroy$.next();
  }

  fetchData(){
     
              this.operationService.getRoutingDetail(this.orderID).subscribe((response : any) => {
                // if(response.error){
                //   alert('Error on routing detail get api');
                //   return;
                // }
                if(response)
                {
                  let model = response.find(i => i.type == this.type && i.deleted_Date == null);
                      if(model){
                        this.routingDetailModel = model;
                        this.isRoutingDetailExist = true;
                        //this.localStorageService.saveData(`${this.orderID}:${this.type}_isRoutingDetailExist`, JSON.stringify(this.isRoutingDetailExist));
                        this.localStorageService.saveData(`${this.orderID}:${this.type}_routingDetail`, 
                                                                JSON.stringify(this.routingDetailModel));
                        this.localStorageService.saveData(`${this.orderID}:${this.type}_routingDetailStatus`, "D");
                      }else
                      {
                        this.initRoutingDetailModel();
                      }
                  }
                  else{
                      this.initRoutingDetailModel();                    
                  }          
              })
  }

  initRoutingDetailModel(){
    //let orderModel : BookingOrder;
    let maxDate : any;
    this.localStorageService.getData(`${this.orderID}:operation_order`).subscribe((result) =>
    {
      if(result)
      {
        this.orderModel = JSON.parse(result);
        this.routingDetailModel = new RoutingDetail();
        this.routingDetailModel.type = this.type;
        this.routingDetailModel.order_ID = this.orderModel.order_ID;
        this.routingDetailModel.routing_Detail_ID = this.orderModel.routing_Detail_ID;
        this.routingDetailModel.pieces = this.orderModel.pieces;
        this.routingDetailModel.weight_Actual_LB = this.orderModel.weight_Actual_LB;
        this.routingDetailModel.weight_Actual_KG = this.orderModel.weight_Actual_KG;
        this.routingDetailModel.weight_Dimensional_LB = this.orderModel.weight_Dimensional_LB;
        this.routingDetailModel.weight_Dimensional_KG = this.orderModel.weight_Dimensional_KG;
        this.routingDetailModel.entered_by = this.authService.userId;
        this.routingDetailModel.entered_date = this.utilsService.getCurrentDate_MMDDYYYY("/");
        this.minDate = this.routingDetailModel.signedDate = this.type == 'POP' ? this.orderModel.load_Date : this.orderModel.delivery_Date;
        //date cannot be more than five business days of Delivery_Date
        maxDate = new Date(this.minDate);
        maxDate.setDate(maxDate.getDate()+7);
        this.maxDate = maxDate;
      }
    })
  }

  configRoutingStatus(){
    this.isCheckBoxValueChanged = false;
    const key_options = `${ApplicationService.instance.order_id}:routingStatusOptions`;   
    let routingStatusOptions:any = this.localStorageService.getItem(key_options);
    routingStatusOptions = (routingStatusOptions)?JSON.parse(routingStatusOptions):[]; 
    this.routingStatusModel = routingStatusOptions.find( item=> item.category == this.type);
    this.operationService.getRoutingNotificationLogs(ApplicationService.instance.order_id).subscribe((result:any)=>{    

      if(result && result.length>0){
        let item_filtered = result.filter(i => i.routing_Code == this.type);
        let item = item_filtered.find(item => item.deleted_By== 0 && item.deleted_Date== null);
       if(item){
          this.routingStatusModel.isSelected = true;
          this.routingStatusModel.email_Log_ID = item.email_Log_ID;
          this.disableCheckBOx = true;      
         }
         else{
          this.routingStatusModel.isSelected = false;
          this.routingStatusModel.email_Log_ID = null;
          this.disableCheckBOx = false
         }
      }else{
        this.routingStatusModel.isSelected = false;
        this.disableCheckBOx = false;
      } 
    })
  }

  getRoutingAttachment(){
    LoaderService.instance.show();
         let getFilesLS:any = this.localStorageService.getDataByOrderId(`${this.type}_atachment_files`);
         if (getFilesLS && getFilesLS.value){
          this.attachmentList = JSON.parse(getFilesLS.value);
          this.attachmentList = this.attachmentList.filter(i => i.deleted_Date == null && (i.statusCode != 'D') )
         // console.log(' this.fileList ', this.attachmentList);
          this.dowloadFiles(this.attachmentList);
          LoaderService.instance.close();
         }
         else{
          this.operationService.getRoutingAttachment(this.orderID).subscribe((response : any) => {
            if(response.error){
              LoaderService.instance.close();
              alert('Error - order/routing/attachment?orderid='+this.orderID);
              return;
            }
           // console.log('response ',response);
            this.attachmentList = response.filter(i => i.type == this.type && i.deleted_Date == null);
            if(this.attachmentList && this.attachmentList.length > 0)
            {
              this.localStorageService.saveData(`${this.orderID}:${this.type}_routingDetailStatus`, "A");           

              for(let item of this.attachmentList)        
              {
                item.statusCode = null;
              }
            }        
            this.localStorageService.saveDataByOrderId(`${this.type}_atachment_files`, JSON.stringify(this.attachmentList));
            this.fileList = new Array();
            this.dowloadFiles(this.attachmentList);
            LoaderService.instance.close();
          });
         }
  }
  private  len:any = 0;
  dowloadFiles(list:any){
      if(this.len < list.length){
        this.operationService.getUploadedFile(list[this.len].file_ID).subscribe((response:any)=>{
            if(response.error){
              alert('Error - filemanager/uploadedfile/${file_ID}');
              return;
            }
            this.fileList.push(response);
            this.len = this.len +1;
            this.dowloadFiles(this.attachmentList);
        });
      }

  }
checkBoxChange(event,routingStatusModel){
   this.isCheckBoxValueChanged = event.target.checked;        
   this.routingStatusModel.sendPic = (event.target.checked==true)?true:false;
   const routingLogs =   this.utilsService.getPopulatedRoutingLogs(this.orderID,{'routingStatus':this.routingStatusModel, 'category' : this.type,});
   this.routingLogs =  routingLogs.filter(item => item.routing_Code == this.type);    
   if(this.routingLogs && this.routingLogs.length==0)
   {
      this.isCheckBoxValueChanged = this.routingStatusModel.isSelected = event.target.checked =  false;      
      const data:any = {title:'Warning',message:`Customer notification is not setup to receive notification.`}
      this.showMessage(data);
   }
}

  actualPiecesChangehandler(event){
    if (this.routingDetailModel) {
      this.routingDetailModel.pieces = event;
      this.routingDetailModel.weight_Actual_KG = Number(event);
      this.emitEvent();
    }
  }

  actualaWeightLBSChangehandler(event){
    if (this.routingDetailModel) {
      this.routingDetailModel.weight_Actual_LB = event;
      this.routingDetailModel.weight_Actual_LB = Number(event);
      this.emitEvent();
    }
  }
  
  actualaWeightKGChangehandler(event){
      if (this.routingDetailModel) {
        this.routingDetailModel.weight_Actual_KG = Number(event);
        this.emitEvent();
      }
    }

    
  focusOutHandler(event){
      if (this.routingDetailModel) {
        // Need to move the calculation to utility service
      this.routingDetailModel.weight_Actual_KG = (Number(event) / 2.20462).toFixed(2);
      }
    // this.actualaWeightKG
  
    }

    signed_NameChangehandler(event){
      if (this.routingDetailModel) {
        this.routingDetailModel.signed_Name = event;
        this.emitEvent();
      }
    }

    signedDateChangehandler(event){
      if (this.routingDetailModel) {
        this.routingDetailModel.signedDate = event;
        this.emitEvent();
      }
    }

    dateChangehandler(event){
      if (this.routingDetailModel) {
        this.routingDetailModel.signedDate = this.convert(event.value) ;
        this.isDateValid = true;
        this.emitEvent();
      }      
    
    }

    dateInputhandler(event){
      event.preventDefault();
    }

    signedTimeChangehandler(event){
      if (this.routingDetailModel) {
        this.routingDetailModel.signedTime = event;
        this.emitEvent();
      }
    }

  
    emitEvent() {
      this.modelChange.emit(this.routingDetailModel);
    }

    getDate() {
      let date: any;
      if (this.routingDetailModel&& this.routingDetailModel.signedDate != null) {        
          date = this.routingDetailModel.signedDate;
      }
     return date;
    }

    getDisplayDate(date){
      if(date && date.indexOf("/") == -1)
      {
        return this.utilsService.getDisplayDate_MMDDYYYY(date, "/")
      }
      else{
        return date;
      }
    }

    
    convert(date) {
      const mnth = ("0" + (date._i.month + 1)).slice(-2);
      const day = ("0" + date._i.date).slice(-2);
      return [date._i.year, mnth, day].join("-");
    }

  addImageClickHandler(event) {
    this.localStorageService.saveData(`${this.orderID}:${this.type}_routingDetail`, 
                                        JSON.stringify(this.routingDetailModel));

    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
    const url = `operations/filemanager/${this.type}/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }

  
  showWarning(){
  const dialogRef = this.dialogService.showConfirmationPopup(Messages.WARNING_TITLE,Messages.SAVE_CHANGES);
   dialogRef.afterClosed().subscribe(result => {
     //console.log('afterClose Event result : ', result);
     if (result && result.clickedCancel) {       
          // Discard dirty check and navigate to previous page
          this.localStorageService.clear(`${this.orderID}:${this.type}_routingDetail`);
          this.localStorageService.clear(`${this.orderID}:${this.type}_atachment_files`);
          this.localStorageService.clear(`${this.orderID}:${this.type}_isRoutingDetailExist`);
          this.router.navigateByUrl(this.prevUrl);
     }
   });
}

  validateInputElement(){
    if(this.inputTextComponent){
      for(let inputElement of this.inputTextComponent.toArray())
      {
        if(!inputElement.validateInputElement())
        {
          return false;
        }      
      }
    }
    return true;
  }

saveClickHandler(event){
  if(!this.validateInputElement()){
    return;
  }
  LoaderService.instance.show();
  if(!this.isRoutingDetailExist){
    let enteredDate = this.routingDetailModel.entered_date.split('/');
    this.routingDetailModel.entered_date = `${enteredDate[2]}-${enteredDate[0]}-${enteredDate[1]}`;
    this.operationService.saveRoutingDetail(this.routingDetailModel).subscribe((result:any) => {
        if(result.error){
          LoaderService.instance.close();
          alert('Error - get shotrak/order/routing/detail')
          return;
        }    
        this.localStorageService.saveData(`${this.orderID}:${this.type}_routingDetailStatus`, "D");   
        this.routingDetailModel = result;
        this.saveRoutingStatus();
        LoaderService.instance.close();
    });   
  }
  else{
    this.saveRoutingLog();
    LoaderService.instance.close();
  }
  
}

saveRoutingStatus(){
  this.localStorageService.clear(`${this.orderID}:${this.type}_atachment_files`);
  this.routingStatus = {     category: this.type,
                            created_by: AuthService.getInstance().userId,
                            created_date: null,
                            order_ID: this.orderID,
                            routing_Code: this.type
                      }
  this.operationService.saveRoutingStatus([this.routingStatus]).subscribe((result:any) => {
    if(result.error){
      LoaderService.instance.close();
      alert('Error - save order/routing/status');
      return;
    }    
    this.saveRoutingLog();
  });
}

private saveRoutingLog()
{
   if(this.isCheckBoxValueChanged)
   {
      this.disableCheckBOx = true;
      this.isCheckBoxValueChanged = false; // to disable save    
      if(this.routingLogs && this.routingLogs.length>0)
      {         
         this.operationService.saveRoutingLogs(this.routingLogs).subscribe((result:any) => {
          if(result.error)
          {
            LoaderService.instance.close();
            alert('Error - order/routing/notification/log');
            return;
          }                
         })
      } 
    }
    this.isRoutingDetailExist = true;
    // this.localStorageService.saveData(`${this.orderID}:${this.type}_isRoutingDetailExist`, JSON.stringify(this.isRoutingDetailExist));
}

private deleteRoutingLogs() {
  this.operationService.deleteRoutingLogs(this.routingStatusModel.email_Log_ID)
  .pipe(takeUntil(this.destroy$))
  .subscribe(()=> {
    this.configRoutingStatus();
  });
}

removePOPOrPODHandler(event){
  const dialogRef = this.dialogService.showConfirmationPopup(Messages.WARNING_TITLE,`Are you sure you want to remove ${this.type} ?`);

  dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
      LoaderService.instance.show();
      this.removeAttachments();
      LoaderService.instance.close();
    }
  });
}

async removeAttachments(){
  await this.getFilesForDelete();
  await this.deleteFiles();
  await this.removeRoutingDetails();
}

getFilesForDelete(){
  let getFilesObs: Observable<any[]> = this.operationService.getFiles(this.orderID);
  getFilesObs.subscribe((response:any)=>{
    this.manageFileList = response.filter(item=> item.deleted_Date ===null && item.file_Type == this.type);

          for(let item of this.manageFileList){
            
            item.deleted_By = AuthService.getInstance().userId;
            item.statusCode = 'D';
            
          }
          
  });
  return getFilesObs.toPromise();
}

deleteFiles(){
  let saveFileDetailsObs: Observable<any[]> = this.operationService.saveFileDetails(this.manageFileList);
  saveFileDetailsObs.subscribe((result:any)=>{
    if(result.error){
      alert('Error');
      LoaderService.instance.close();
      return;
    }
  });
  return saveFileDetailsObs.toPromise();
}

removeRoutingDetails(){
  let removeRoutingDetailsObs: Observable<any[]> = this.operationService.removeRoutingDetail(this.orderID, this.type, this.routingDetailModel.routing_Detail_ID);
  removeRoutingDetailsObs.subscribe(() => {
    // console.log('Record deleted successfully. Order Id : ' , this.orderID, ' type : ', this.type)
    this.localStorageService.clear(`${this.orderID}:${this.type}_routingDetail`);
    this.localStorageService.clear(`${this.orderID}:${this.type}_atachment_files`);
    //this.localStorageService.clear(`${this.orderID}:${this.type}_isRoutingDetailExist`);
    this.localStorageService.clear(`${this.orderID}:${this.type}_routingDetailStatus`);
    this.isRoutingDetailExist = false;
    this.initRoutingDetailModel();
    this.getRoutingAttachment();
    this.deleteRoutingLogs();
  });
  return removeRoutingDetailsObs.toPromise();
}

closeBtnClickhandler(event){
  //this.localStorageService.saveDataByOrderId(`${this.tabID}_atachment_files`,JSON.stringify(this.fileList));
  // before close check dirty.
  if(this.isDirty()){
    this.showWarning();
    return false;
  }
  this.localStorageService.clear(`${this.orderID}:${this.type}_routingDetail`);
  this.localStorageService.clear(`${this.orderID}:${this.type}_atachment_files`);
  //this.localStorageService.clear(`${this.orderID}:${this.type}_isRoutingDetailExist`);
  this.router.navigateByUrl(this.prevUrl);
}


getuserName(userId) 
{
  return userId == AuthService.getInstance().userId ? AuthService.getInstance().userName : userId;
}

private showMessage(data:any)
{
  const dialogRef = this.dialogService.showInfoPopup(data.title,data.message);

   dialogRef.afterClosed().subscribe(result => {
     if (result && result.clickedCancel) {       
          
     }
   });
}

private isDirty():boolean {
  let dirty:boolean = false;
  if(!this.isRoutingDetailExist ){
    const _date:any = this.type == 'POP' ? this.orderModel.load_Date : this.orderModel.delivery_Date;
    return this.routingDetailModel.pieces != this.orderModel.pieces 
    || this.routingDetailModel.weight_Actual_LB != this.orderModel.weight_Actual_LB
    ||  this.routingDetailModel.signedDate != _date
    || this.routingDetailModel.signed_Name != null && this.routingDetailModel.signed_Name.length > 0
    || this.routingDetailModel.signedTime != null && this.routingDetailModel.signedTime.length > 0
    || this.routingStatusModel.isSelected == true && this.disableCheckBOx == false
  }else{
    return this.routingStatusModel.isSelected == true && this.disableCheckBOx == false
  }
}

}
