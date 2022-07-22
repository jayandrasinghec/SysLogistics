import { Component, OnInit, ViewEncapsulation,ViewChild } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import { OperationsService }from 'src/app/services/operation.service' ;
import { UtilsService } from 'src/app/services/Utils.service';
import AuthService from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { Messages } from 'src/app/common/Messages';
import { Observable } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

  private tabID:any;
  private prevUrl:any;
  private routingDetailModel:any;
  public orderID:any;

  public formModel:any;
  public fileList:any[] =[];
  private selectedIndex:any;
  public headerLabel:string;
  public isFormValid:boolean = true;
  public disabledSave: boolean = true;
  public disabledUpload: boolean = true;
 
  // @ViewChild('description', {static: false}) description: any;

  constructor(private localStorageService: LocalStorageService, 
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private operationService:OperationsService,
              private utilsService : UtilsService,
              public dialogService: DialogService,) { }

  ngOnInit() {
    const arrLabels: any= [{id:'PU',label:'Pickup'},
                          {id:'DEL',label:'Delivery'},
                          {id:'AL',label:'Airline'},
                          {id:'POP',label:'Proof of Pickup'},
                          {id:'POD',label:'Proof of Delivery'},
                          {id:'SFP',label:'Service Failure'},
                          {id:'SFD',label:'Service Failure'},
                          {id:'SFA',label:'Service Failure'}];

    this.orderID = ApplicationService.instance.order_id
    this.tabID = this.activatedRoute.snapshot.paramMap.get('tabId') ;
    this.prevUrl = this.localStorageService.getItem(`${this.orderID}:navigateUrl`);
    this.headerLabel = arrLabels.find(item => item.id == this.tabID).label ;

    this.fetchNsave();
    this.configModel();
  }

  async fetchNsave(){
    await this.fetchData();
    await this.getFiles();
    await this.updateAttachment();
    this.disabledSave = true;
    this.disabledUpload = false;
  }

  async saveBtnClickhandler(){
    this.disabledSave = this.disabledUpload = true;
    await this.saveFilelist();
    await this.getFiles();
    this.disabledSave =true;
    this.disabledUpload = false;
  }

  fetchData(){
      let fetchDataObs:Observable<any[]> = this.operationService.getRoutingDetail(this.orderID);
      
      fetchDataObs.subscribe((response : any) => {
        if(response){
          this.routingDetailModel = response[0];
        }
      });

      return fetchDataObs.toPromise();
  }

  configModel(){
    this.formModel = {}
  }

  getFiles(){
    let getFilesObs:Observable<any[]> = this.operationService.getFiles(this.orderID);
    
    getFilesObs.subscribe((response:any)=>{
        this.fileList = response.filter(item=> item.deleted_Date ===null && item.file_Type == this.tabID);
        if( this.tabID =='POP' ||  this.tabID =='POD'||  this.tabID =='SFP' ||  this.tabID =='SFD' ||  this.tabID =='SFA' ){
           this.fileList = this.fileList.filter(item=> item.file_Type == this.tabID );
           let getFilesLS:any = this.localStorageService.getDataByOrderId(`${this.tabID}_atachment_files`);
           let sfType: any =  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:${this.tabID}`); 
          getFilesLS = (getFilesLS && getFilesLS.value) ? JSON.parse(getFilesLS.value) : [];

              for(let item of this.fileList){
                
                let file =  getFilesLS.find(i => i.file_ID == item.file_ID);
                if(file){
                    file.statusCode = 'U';
                }
                else {
                  getFilesLS.push({
                    file_ID : item.file_ID,
                    order_ID : item.order_ID,
                    type : item.file_Type,
                    statusCode : 'I',
                    routing_Type : sfType,
                    created_date: item.created_Date,
                    created_by:item.created_By
                  });
                  this.disabledSave = false; 
                }
              }
              
              for(let item of getFilesLS){
                let file =  this.fileList.find(i => i.file_ID == item.file_ID);
                if(!file)
                {
                  item.statusCode = 'D'
                }
              }             
            this.localStorageService.saveDataByOrderId(`${this.tabID}_atachment_files`, JSON.stringify(getFilesLS));
        }
    });

    return getFilesObs.toPromise();

  }

  isDirty(){
    const dirtyItems = this.fileList.filter(item => item.statusCode !== null)
    if(dirtyItems && dirtyItems.length>0){
      return true;
    }
     return false;
  }

  /*-------------------------*/
  closeBtnClickhandler(event){
    if(this.isDirty()){
      this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE,Messages.SAVE_CHANGES)
      .afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
          this.saveBtnClickhandler();
        }
        this.localStorageService.clear(`${ApplicationService.instance.order_id}:${this.tabID}`); 
        this.router.navigateByUrl(this.prevUrl);
      });
    }else{
      //this.localStorageService.saveDataByOrderId(`${this.tabID}_atachment_files`,JSON.stringify(this.fileList));
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:${this.tabID}`); 
      this.router.navigateByUrl(this.prevUrl);
    }
  }

  uploadBtnClickhandler(event){
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateSubUrl`,this.router.url)
      const url = `operations/filemanager/${this.tabID}/uploadfile/${ApplicationService.instance.order_id}`;
      this.router.navigateByUrl(url);
  }

  saveFilelist(){
    LoaderService.instance.show();
    let saveBtnClickObs: Observable<any[]> =  this.operationService.saveFileDetails(this.fileList)
    
    saveBtnClickObs.subscribe((result:any)=>{
      if(result.error){
        alert('Error');
        return;
      }
      LoaderService.instance.close();
    }); 

    return saveBtnClickObs.toPromise();
  }

  updateAttachment(){
    // update attachment here, incase there is new image added
    let updateAttachmentPromise:any;
    let getFilesLS:any = this.localStorageService.getDataByOrderId(`${this.tabID}_atachment_files`);
    getFilesLS = (getFilesLS && getFilesLS.value) ? JSON.parse(getFilesLS.value) : [];
    const attachmentData = getFilesLS.filter(i => i.statusCode && i.statusCode == 'I');
    if(attachmentData) {
      updateAttachmentPromise = this.saveRoutingAttachment(attachmentData);
      // if(updateAttachmentPromise){
      //   for(let item of attachmentData){
      //       item.statusCode = 'U'
      //   } 
      //   this.localStorageService.saveDataByOrderId(`${this.tabID}_atachment_files`, JSON.stringify(getFilesLS)); 
      // }
      return updateAttachmentPromise;
    }
    return Promise.resolve();
  }
  /*-------------------------*/
  editRow(row,i){
    this.selectedIndex = i;
    this.formModel =  Object.assign({},row);
  }

  downloadRow(row,i){
      const contentType:any =  this.utilsService.getContentType(row.file_Extension);  
      this.operationService.getUploadedFile(row.file_ID).subscribe((result:any)=>{
        if(result && result.file_Data){       
          var a = document.createElement("a");       
          // a.href = `data:${contentType} ;base64,${result.file_Data}`; 
          a.href = result.file_Data ;   // result.file_Data;
          a.download = row.file_Name ;  
          a.click();  
        }
      });
  }

  deleteRow(row,i){
    this.dialogService.showConfirmationPopup(Messages.DELETE_TITLE,Messages.CONFIRM_DELETE_ROW)
      .afterClosed().subscribe(result => {
      if (result && result.clickedOkay) {
          this.deleteRecords(row,i);
        }
      });
  }

  updateBtnClickhandler(event){
    if(!this.validateFields() || this.formModel.file_Name==undefined){
      return false;
    }
    this.formModel.statusCode=  (this.formModel.statusCode!=='I')? 'U':'I';
    this.formModel.modified_By =  AuthService.getInstance().userId;
    Object.assign(this.fileList[this.selectedIndex],this.formModel); 
    this.formModel.file_Description = undefined;
    this.formModel.file_Name = undefined;
    this.selectedIndex = null;  
    this.disabledSave = false;
  }

  getFormattedDate(dateTime){
    return this.utilsService.getDisplayDate(dateTime);
  }
 
  validateFields() {
        this.isFormValid = true;
        if (this.formModel &&  this.formModel.file_Description === undefined || this.formModel.file_Description === '') {
          this.isFormValid = false ;
        }       
        return this.isFormValid;
  }

  deleteRecords(row , index) {
    if (row.statusCode && row.statusCode === 'I') {
      this.fileList.splice(index, 1);
    } else {
      row.deleted_By = AuthService.getInstance().userId;
      row.statusCode = 'D';
    }
    this.disabledSave = false;
  }

  checkBtnDisable(){
    return this.formModel.file_Description==undefined || this.formModel.file_Name== undefined || this.formModel.file_Description=='';

  }

  saveRoutingAttachment(attachmentData){
    this.localStorageService.clear(`${this.orderID}:${this.tabID}_routingDetail`);
    
    if(attachmentData && attachmentData.length > 0){

      if(this.routingDetailModel){
        for(let item of attachmentData){
          delete item.statusCode;
          delete item.routing_Type;
          item.deleted_By = 0;
          item.deleted_Date = null;
          item.routing_Detail_ID = this.routingDetailModel.routing_Detail_ID;
        }
      }else{
        LoaderService.instance.close();
        console.error('routing_Detail_ID not found');
        return;
      }

      let saveRoutingAttachmentObs : Observable <any[]> = this.operationService.saveRoutingAttachment(attachmentData);
      saveRoutingAttachmentObs.subscribe((result : any) => {
        if(result.error){
          LoaderService.instance.close();
          return;
        }
        this.localStorageService.saveData(`${this.orderID}:${this.tabID}_routingDetailStatus`, "A");
        return saveRoutingAttachmentObs.toPromise();
      });
    }
  }

  descriptionChangehandler(event){
    this.formModel.file_Description = event;
  }
}
