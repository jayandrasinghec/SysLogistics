import { Component, OnInit ,ViewChildren,QueryList,ViewEncapsulation} from '@angular/core';
import { OperationsService } from 'src/app/services/operation.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { ApplicationService } from 'src/app/services/application.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceFailure } from 'src/app/core/models/service-failure.model';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { ServiceFailureAttachment } from 'src/app/core/models/service-failure-attchment.model';
import { DropdownGridComponent } from 'src/app/content/partials/components/dropdown-grid/dropdown-grid.component';
import {InputTextComponent} from 'src/app/content/partials/components/inputtext/inputtext.component';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-service-failure',
  templateUrl: './service-failure.component.html',
  styleUrls: ['./service-failure.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class ServiceFailureComponent implements OnInit {
  @ViewChildren(DropdownGridComponent) dropDownComponents: QueryList<DropdownGridComponent>;
  @ViewChildren(InputTextComponent) inputTextChildren: QueryList<InputTextComponent>;   
  private operationModel : any;
  public ddCarrierCodes:any[]= [];
  public arrCarriersList:any[]= [];
  public ddCarrierCodesHeaders:any[] =[["Code","carrierCode"], ["Type","carrierServiceLevelCode"], ["Name","carrierName"]];

  public carrierCodeValue:any;
  public ddReset:boolean = false;
  public type : any = '';
  public objServiceFailure : ServiceFailure;
  public serviceFailures:any[]=[];
  //public serviceFailuresData : any[] = [];
  private serviceFailureAttachment : ServiceFailureAttachment;
  public serviceFailureAttachmentData : any[] = [];
  private authService:any;
  private previousUrl : any
  public sfType : any;
  private tabID : any;
  private selectedAgent : any;
  public isUpdate : boolean  ;
  public isEditMode: boolean = true ;
  public disableNewBtn : boolean = true;
  public selectedRowIndex : any;
  private fileList: any;
  private agentName : any;
  public isServiceFailureExist : boolean;
  public arrRoutingTypes : any[] = [
    {id:'PU', routing_type : 'P/U', description : 'Pickup'},
    {id:'DEL', routing_type : 'DEL', description : 'Delivery'},  
    {id:'AL', routing_type : 'Airline', description : 'Airline/Linehaul'}
  ];

  public arrServiceFailureTypes: any[] = [
    {type : "Failure"},
    {type : "Exception"}
  ];

  public showNavBtns:boolean = false;
  public navIndex:any = 0;
  public commentsValid:boolean = true;
  public isDateValid:boolean = true;
  public minDate:any;
  public is_DP_Editable:boolean = true;
  public failureNotes:any[]=[];
  constructor(
    private operationService : OperationsService,
    private localStorageService : LocalStorageService,
    private router : Router,
    private activatedRoute : ActivatedRoute,
    private dialogService : DialogService,
    private utilsService : UtilsService,
    private rulesService:BusinessRulesService
  ) {
    //this.serviceFailuresData = new Array();
    this.authService = AuthService.getInstance();
    if(this.authService.hasToken){
      this.localStorageService.getData(`${ApplicationService.instance.order_id}:operation_order`).subscribe((result) =>
      {
        if(result)
        {
          this.operationModel = JSON.parse(result);                      
         // this.getCarrierCodes();
           this.getCarriersList();
        }
      })      
    }else{
      this.router.navigateByUrl("login");
    }
   
    // this.getRoutingAgent();
    // this.getServiceFailure();
   }

  ngOnInit() {      
    this.objServiceFailure = new ServiceFailure();      
    this.tabID = this.activatedRoute.snapshot.paramMap.get('tabId');
    this.type = this.getFileType(this.tabID)
    this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:${this.tabID}_navigateUrl`)
    let serviceFailureType = this.arrRoutingTypes.filter(x => x.id == this.tabID); 
    this.sfType = serviceFailureType[0].routing_type;   
    this.is_DP_Editable = this.isEditable('failure_Date');
    this.getRoutingAgent();
    this.getServiceFailure();
    this.getServiceFailureAttachment();    
  }

  initializeModel(){    
    this.objServiceFailure = new ServiceFailure();      
    let serviceFailureType = this.arrRoutingTypes.filter(x => x.id == this.tabID);
    this.objServiceFailure.order_ID = this.operationModel.order_ID;
    this.objServiceFailure.routing_Type = this.sfType;
    this.objServiceFailure.customer_Name = this.operationModel.billTo_Name;
    this.objServiceFailure.failure_Type = this.arrServiceFailureTypes[0].type;
    this.objServiceFailure.agent_Name = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:${this.tabID}_agentName`);
  }

  getCarrierCodes(){
    this.localStorageService.getData('ddCarrierCodes').subscribe((result) => {
      if(result){
        this.ddCarrierCodes = JSON.parse(result);
        if(this.objServiceFailure  && this.objServiceFailure.carrier_Code){
               this.carrierCodeValue = this.ddCarrierCodes.find(item =>  item.carrier_code == this.objServiceFailure.carrier_Code).carrier_name ;                    
          }
      }
      else{
        this.operationService.getCarrierCodes().subscribe((result:any)=>{
         // console.log('getCarrierCodes   ',result,result.length);
          this.ddCarrierCodes = result.filter(item => item.carrier_code != null && item.carrier_code != ' ' && item.carrier_code != '' && item.carrier_code != '...'  );
        //  console.log(' this.ddCarrierCodes   ', this.ddCarrierCodes, this.ddCarrierCodes.length);
          if(this.objServiceFailure  && this.objServiceFailure.carrier_Code){
               this.carrierCodeValue = this.ddCarrierCodes.find(item =>  item.carrier_code == this.objServiceFailure.carrier_Code).carrier_name ;                    
          }
          this.localStorageService.saveData('ddCarrierCodes', JSON.stringify(this.ddCarrierCodes));
       });
      }
    })    
  }

  getRoutingAgent(){
      this.operationService.getRoutingAgent(ApplicationService.instance.order_id).subscribe((result:any)=>{
        //  console.log('getRoutingAgent : ',result);
          if(result){                    
             for(let item of result){
                 if(this.tabID == 'PU' && item.pickup_Agent_Name != null ) {
                  this.objServiceFailure.agent_Name = item.pickup_Agent_Name;
                 }
                 if(this.tabID == 'DEL' && item.delivery_Agent_Name != null){
                  this.objServiceFailure.agent_Name = item.delivery_Agent_Name;
                 }
             } 
             this.localStorageService.saveData(`${ApplicationService.instance.order_id}:${this.tabID}_agentName`, this.objServiceFailure.agent_Name)
          }      
      });    
  }


  getServiceFailure(){
    this.isServiceFailureExist = false;
    let key = `${ApplicationService.instance.order_id}:serviceFailure`;
    this.localStorageService.getData(key).subscribe((result:any) => {
      if(result){
        result = JSON.parse(result);
        this.serviceFailures = result.filter(x => x.routing_Type == this.sfType);
        if(this.serviceFailures && this.serviceFailures.length>0) { 
            this.objServiceFailure = this.serviceFailures.find(item => item.id != undefined && item.id != '') ; 
            if( this.objServiceFailure == undefined) { 
              this.objServiceFailure = this.serviceFailures[0] ; 
                   
            }
            this.filterServiceFailureNotes(this.objServiceFailure);
            this.showNavBtns = (this.serviceFailures.length>1) ? true : false;
            if(this.arrCarriersList && this.arrCarriersList.length>0){
              const selectedCarrier  = this.arrCarriersList.find(item =>  item.carrierCode == this.objServiceFailure.carrier_Code) ;                   
              if(selectedCarrier){
                 this.carrierCodeValue = selectedCarrier.carrierName
              }             
           }        
             this.isServiceFailureExist = this.objServiceFailure.created_date != null ? true : false;  
            // this.isEditMode =true ;
             this.isUpdate = (this.isServiceFailureExist)? true: false;
            // this.disableNewBtn = false;
             this.objServiceFailure.id = undefined;    
             this.localStorageService.saveData(key, JSON.stringify(this.serviceFailures)); 
            // this.checkAndUpdateNewButton();
        }  
        else{
            this.isEditMode =true ;
            this.is_DP_Editable = this.isEditable('failure_Date');
            this.isUpdate = false;
            this.disableNewBtn = true;
        }           
     }
      else{
        this.operationService.getServiceFailure(ApplicationService.instance.order_id).subscribe((result:any)=>{   
          if(result){   
                 this.serviceFailures = result.filter(x => x.routing_Type == this.sfType);
                 if(this.serviceFailures && this.serviceFailures.length>0){                   
                  //  console.log('this.serviceFailures  ',this.serviceFailures );
                    this.objServiceFailure = this.serviceFailures[0];
                    this.showNavBtns = (this.serviceFailures.length>1) ? true : false;
                    this.isEditMode =false ;
                    this.is_DP_Editable = this.isEditable('failure_Date');
                  //  this.isUpdate = true; 
                   // this.disableNewBtn = false;
                    if(this.objServiceFailure){   
                        this.isUpdate = true; 
                        this.isServiceFailureExist = this.objServiceFailure.created_date != null ? true : false; 
                        const selectedCarrier  = this.arrCarriersList.find(item =>  item.carrierCode == this.objServiceFailure.carrier_Code) ;                    
                        if(selectedCarrier){
                          this.carrierCodeValue = selectedCarrier.carrierName
                        }  
                        this.filterServiceFailureNotes(this.objServiceFailure)          
                       // this.localStorageService.saveData(key, JSON.stringify(this.serviceFailures));                 
                     }  
                   //  this.checkAndUpdateNewButton();                  
                  }else{
                     this.isEditMode =true ;
                     this.is_DP_Editable = this.isEditable('failure_Date');
                     this.isUpdate = false; 
                     this.disableNewBtn = true;
                      this.initializeModel();
                  }              
          }
          else{

            this.initializeModel();
          }
       });
      }
    })
  }

  getServiceFailureAttachment(){
    
        let key = `${ApplicationService.instance.order_id}:${this.type}_atachment_files`;
        this.localStorageService.getData(key).subscribe((result) => {
          if(result){
            this.serviceFailureAttachmentData = JSON.parse(result);
            this.fetchFiles();
          }
          else{
            this.operationService.getServiceFailureAttachment(ApplicationService.instance.order_id).subscribe((result:any)=>{   
              if(result){ 
                this.serviceFailureAttachmentData = result.filter(x => x.deleted_Date ===null);
                this.localStorageService.saveData(key, JSON.stringify(this.serviceFailureAttachmentData));
                this.fetchFiles();
              }
            })    
        }   
    });
  }

  fetchFiles(){    
    this.serviceFailureAttachmentData  = this.serviceFailureAttachmentData.filter(x => x.routing_Type == this.sfType);      
    if(this.serviceFailureAttachmentData.length > 0){      
    this.operationService.getFiles(ApplicationService.instance.order_id).subscribe((response:any)=>{
    if(response){          
      this.fileList = response.filter(item=> item.deleted_Date ===null && item.file_Type == this.type);
          for(let item of this.serviceFailureAttachmentData){
              let file = this.fileList.find(i => i.file_ID == item.file_ID)
              if(file){
                item.itemIndex = item.itemIndex+1;
                item.file_name = file.file_Name;
                item.comment = file.file_Description;
              }
          }             
          
        }
    });  
  }   
  }

  getFiles(){
    this.operationService.getFiles(ApplicationService.instance.order_id).subscribe((response:any)=>{
      if(response){
        this.fileList = response.filter(item=> item.deleted_Date ===null && item.file_Type == this.tabID);
      }
    });
  }

  ddCarrierCodeSelecthandler(event){
    const selectedCarrierCode:any = event['carrierCode'];
    const found:any = this.serviceFailures.find(item=> item.carrier_Code == selectedCarrierCode );
    if(found){
          this.carrierCodeValue = null;
          this.objServiceFailure.carrier_Code = null;
          this.showMessage();   
          return;         
    }
    this.objServiceFailure.carrier_Code = selectedCarrierCode;
    
   }

   resetCarrierDropDown(){
    const owner = this;
    owner.ddReset = false;    
    setTimeout(()=>{
      owner.ddReset = true;    
    },10);  
 }

 getFormattedDate(dateTime){
  return this.utilsService.getDisplayDate(dateTime);
}
  getFormattedTime(dateTime){
  return this.utilsService.getDisplayTime(dateTime);
}
/* Add button removed as per talk with client
addClickHandler(event){
    //Validate data before adding to collection
    //fill the service failure object
    //this.serviceFailure.itemIndex = this.serviceFailuresData.length;

     this.disableNewBtn = true;
     this.isEditMode =  true ;
     this.is_DP_Editable = this.isEditable('failure_Date');
     this.isUpdate = false;

    this.initializeModel();
    this.resetCarrierDropDown();
    this.objServiceFailure.statusCode = 'I';
    this.objServiceFailure.created_by = AuthService.getInstance().userId;
    this.objServiceFailure.order_ID = this.operationModel.order_ID;
    this.objServiceFailure.created_date = null;
    this.objServiceFailure.failure_Date = null;
   // console.log('this.objServiceFailure', this.objServiceFailure);
    
    //add service failure to collection
    //this.serviceFailuresData.push(this.objServiceFailure);
    // this.localStorageService.saveData(`${ApplicationService.instance.order_id}:serviceFailure`, JSON.stringify(this.serviceFailuresData))
    // reset the details
   
  }
*/
  updateClickHandler(event){
     if (!this.validateIPElements()) {
       return ;
     }
    
      let sendData:any = Object.assign({},this.objServiceFailure);
      sendData.statusCode = 'U';
      sendData.modified_by = AuthService.getInstance().userId;
      sendData.comment =  this.objServiceFailure.comment + '&&' + this.failureNotes.map( item => item.noteText).join('&&')  ;
     // console.log('this.sendData  :',sendData);

      let getFilesLS:any = this.localStorageService.getDataByOrderId(`${this.type}_atachment_files`);
      getFilesLS = getFilesLS && getFilesLS.value ? JSON.parse(getFilesLS.value) : [];
      let attachmentData = getFilesLS.filter(i => i.statusCode != null);
      if(attachmentData && attachmentData.length > 0){
        for(let item of attachmentData)
        {
          delete item.type;
          item.routing_Type = this.sfType;
          item.created_By = AuthService.getInstance().userId;
          item.created_date  = null;
        }
      }
     // console.log('attachmentData', attachmentData)
      this.operationService.saveServiceFailure([sendData]).subscribe((result:any)=>{   
        if(result){       
               // console.log('saveClickHandler', result);
                this.objServiceFailure = result[0];
                this.filterServiceFailureNotes(this.objServiceFailure);
                this.operationService.saveServiceFailureAttachment(attachmentData).subscribe((response : any) =>{
                //  console.log('saveClickHandler', response);
                  this.isEditMode = false;
                  this.is_DP_Editable = this.isEditable('failure_Date');
                  this.isUpdate = true;                
                //  this.checkAndUpdateNewButton();
                })
            }
       });
       

  }

  editItemClickHandler(row,index){
    this.objServiceFailure = null;
    this.objServiceFailure = Object.assign({}, row) ;
    this.isUpdate = true;
    this.selectedRowIndex = index ;
    this.carrierCodeValue = this.ddCarrierCodes.find(item =>  item.carrier_code == this.objServiceFailure.carrier_Code).carrier_name ;  
   // console.log('editRow  ', this.objServiceFailure);
    this.ddReset = false;     
   }

   deleteRow(row, index) {
        const dialogRef = this.dialogService.showConfirmationPopup(Messages.DELETE_TITLE,Messages.CONFIRM_DELETE_ROW);
    
        dialogRef.afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
          if (row.statusCode && row.statusCode === 'I') {
            this.serviceFailureAttachmentData.splice(row.itemIndex , 1);
            let i = 0;
            for(let item of this.serviceFailureAttachmentData)
            {
              item.itemIndex = i++;
            }
          } else {
            row.statusCode = 'D';
            row.deleted_By =  AuthService.getInstance().userId;
            this.localStorageService.saveData(`${ApplicationService.instance.order_id}:${this.type}_atachment_files`, 
                    JSON.stringify(this.serviceFailureAttachmentData))
          }
          this.initializeModel();
          }
        });
       // this.ddReset = true;
       // this.resetServiceDropDown();
    }


  uploadImageClickHandler(event) {
    this.objServiceFailure.id =  'id_0';
    this.objServiceFailure.comment =  this.failureNotes.map( item => item.noteText).join('&&')  ;
  //  console.log('this.objServiceFailure.comment  :',this.objServiceFailure.comment);

    if(this.serviceFailures.length == 0){
      this.serviceFailures.push(this.objServiceFailure);
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:serviceFailure`, 
                                        JSON.stringify(this.serviceFailures));
                                        
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:${this.type}`, 
                                        this.sfType);  

    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
    const url = `operations/filemanager/${this.type}/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }

  dateChangehandler(event){    
    if (this.objServiceFailure) {
      this.isDateValid = true;
      this.objServiceFailure.failure_Date = this.convert(event.value) ;
    }      

  }
     
  convert(date) {
   // console.log('convert date', date);
    const mnth = ("0" + (date._i.month + 1)).slice(-2);
    const day = ("0" + date._i.date).slice(-2);
    return [date._i.year, mnth, day].join("-");
  }

  getDate(){
    let date: any;
    if (this.objServiceFailure && this.objServiceFailure.failure_Date != null) {        
        date = this.objServiceFailure.failure_Date;
    }
   return date;
  }

  getuserName(userId) 
  {
    return userId == AuthService.getInstance().userId ? AuthService.getInstance().userName : userId;
  }

  closeClickHandler(event){
    //need to do dirty check
    let key = `${ApplicationService.instance.order_id}:serviceFailure`;
    this.localStorageService.clear(key)
    this.router.navigateByUrl(this.previousUrl);
  }

  saveClickHandler(event){
    // for(let item of this.serviceFailuresData){
    //   delete item.itemIndex;
    //   item.created_date = null;
    //   item.failure_Date = this.utilsService.getCurrentDate();
    // }
    if(!this.validateIPElements()){
      return false;
    }

    this.objServiceFailure.created_date = null;
    this.objServiceFailure.statusCode = 'I';
    this.objServiceFailure.failure_Date = this.utilsService.getCurrentDate();

    let getFilesLS:any = this.localStorageService.getDataByOrderId(`${this.type}_atachment_files`);
    getFilesLS = getFilesLS && getFilesLS.value ? JSON.parse(getFilesLS.value) : [];
    let attachmentData = getFilesLS.filter(i => i.statusCode != null);
    if(attachmentData && attachmentData.length > 0){
      for(let item of attachmentData)
      {
        delete item.type;
        item.routing_Type = this.sfType;
        item.created_By = AuthService.getInstance().userId;
        item.created_date  = null;
      }
    }
   // console.log('attachmentData', attachmentData)

    if(this.objServiceFailure.created_date == null){
    this.operationService.saveServiceFailure([this.objServiceFailure]).subscribe((result:any)=>{   
      if(result){       
              //console.log('saveClickHandler', result);
              this.objServiceFailure = result[0];
              this.filterServiceFailureNotes(this.objServiceFailure);
              this.operationService.saveServiceFailureAttachment(attachmentData).subscribe((response : any) =>{
                //console.log('saveClickHandler', response);
                 this.isEditMode = false;
                 this.is_DP_Editable = this.isEditable('failure_Date');
                 this.isUpdate = true;
               //  this.disableNewBtn = false;
                 this.serviceFailures = this.serviceFailures.concat(result);
               //  this.checkAndUpdateNewButton();
              })
          }
        });
      }
      else if(attachmentData && attachmentData.length > 0){
        this.operationService.saveServiceFailureAttachment(attachmentData).subscribe((response : any) =>{
         // console.log('saveClickHandler', response);
           this.isEditMode = false;
           this.is_DP_Editable = this.isEditable('failure_Date');
           this.isUpdate = true;
           this.disableNewBtn = false;
        })
      }
  }
  EditClickHandler(event){
    if(!this.isEditMode){
        this.isEditMode =true;
        this.is_DP_Editable = this.isEditable('failure_Date');
      }
  }
  NotesChangeHandler(event){

  }
  navBtnClickHandler(type){
    if(type=='next'){
        this.navIndex = this.navIndex +1;
      }
      else{
      this.navIndex = this.navIndex - 1;
    }
    this.objServiceFailure = this.serviceFailures[this.navIndex];
  }
  getCarriersList(){
    this.localStorageService.getData(`${ApplicationService.instance.order_id}:carriersList`).subscribe((result) => {
      if(result){
        this.arrCarriersList = JSON.parse(result);
        if(this.objServiceFailure  && this.objServiceFailure.carrier_Code){
              const selectedCarrier  = this.arrCarriersList.find(item =>  item.carrierServiceLevelCode == this.objServiceFailure.carrier_Code) ;                    
              if(selectedCarrier){
                 this.carrierCodeValue = selectedCarrier.carrierName
              }
          }
      }
      else{

        this.operationService.getCarriers(ApplicationService.instance.order_id).subscribe((response:any)=>{
        if(response.error){
          alert('Error - get orders/${orderId}/carriers');
          return false;
        }
        this.arrCarriersList = response.carriers.filter(element => element.carrierCode !== null);
         if(this.objServiceFailure  && this.objServiceFailure.carrier_Code){
              const selectedCarrier  = this.arrCarriersList.find(item =>  item.carrierServiceLevelCode == this.objServiceFailure.carrier_Code) ;                    
              if(selectedCarrier){
                 this.carrierCodeValue = selectedCarrier.carrierName
              }
          }
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:carriersList`, JSON.stringify(this.arrCarriersList));
      });

        /*  this.operationService.getCarrierCodes().subscribe((result:any)=>{
          console.log('getCarrierCodes   ',result,result.length);
          this.ddCarrierCodes = result.filter(item => item.carrier_code != null && item.carrier_code != ' ' && item.carrier_code != '' && item.carrier_code != '...'  );
          console.log(' this.ddCarrierCodes   ', this.ddCarrierCodes, this.ddCarrierCodes.length);
          if(this.objServiceFailure  && this.objServiceFailure.carrier_Code){
               this.carrierCodeValue = this.ddCarrierCodes.find(item =>  item.carrier_code == this.objServiceFailure.carrier_Code).carrier_name ;                    
          }
          this.localStorageService.saveData('ddCarrierCodes', JSON.stringify(this.ddCarrierCodes));
       }); */
      }
    }) 

} 
getFileType(tabID:any) {
      let file_type:any;
      switch(tabID){
        case 'PU':
        file_type = 'SFP';
        break;
        case 'DEL':
        file_type = 'SFD';
        break;
        case 'AL':
        file_type = 'SFA';
        break;
      }
      return file_type;
  }
  validateIPElements() 
  {
      let isFormValid = true;     
      if (this.objServiceFailure &&  this.objServiceFailure.comment === undefined || this.objServiceFailure.comment === '') {
        isFormValid=  this.commentsValid = false ;
      }
     if (this.objServiceFailure.failure_Date == (undefined || null) ){
      isFormValid = this.isDateValid = false;
      }
     if (this.inputTextChildren) {     
        for (let inputText of this.inputTextChildren.toArray()) {
          if(!inputText.validateInputElement())
          {
            isFormValid = false;
          }
        }
     }
      if (this.dropDownComponents) {
        for (let dropdown of this.dropDownComponents.toArray()) {
          if (!dropdown.validateInputElement())  {
            isFormValid = false;
          }
        }
      }
      return isFormValid;
}

commentChange(event) 
{
 this.objServiceFailure.comment = event;
 this.commentsValid = true;
}

isEditable(fieldName) {       
  if(this.isEditMode) {  
    return this.rulesService.shouldEditable(fieldName);
    }
  return this.isEditMode;
 }

private showMessage(){
    const _owner:any = this;
    const dialogRef = this.dialogService.showInfoPopup(Messages.WARNING_TITLE,Messages.CARRIER_CODE_IN_USE);
    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
      this.carrierCodeValue = null;
      this.objServiceFailure.carrier_Code = null;
    }});
 }

// checking all the carrier has service failure notes
/* private checkAndUpdateNewButton(){
    if(this.arrCarriersList &&  this.arrCarriersList.length>0 && this.serviceFailures && this.serviceFailures.length>0 ){
       for(var item of this.arrCarriersList)
        {
            const found:any = this.serviceFailures.find(failure => failure.carrier_Code == item.carrierCode );
            if(found==undefined){
              this.disableNewBtn = false;
              break;
            }
        }
    }
  }*/

  private filterServiceFailureNotes(serviceFailure:any){
    const comments:any[] =  serviceFailure.comment.split('&&') ;    
    this.failureNotes =[];
    for(var item of comments){
      this.failureNotes.push({
              date:serviceFailure.created_date,
              userId:serviceFailure.created_by,
              noteText:item,
            });
    } 
    serviceFailure.comment ='';  
  }



}
