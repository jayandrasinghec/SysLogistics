import { Component, OnInit,Input,Output,EventEmitter,SimpleChanges } from '@angular/core';
import { ApplicationService } from 'src/app/services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/Utils.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-operations-footer',
  templateUrl: './operations_footer.component.html',
  styleUrls: ['./operations_footer.component.scss']
})
export class OperationsFooterComponent implements OnInit {

  @Input() model:any;
  @Input() routingAgents:any;
  @Input() carrierList:any;
  @Input() orderStatusModel:any;
  @Input() routingNotes:any;
  @Output() clickEvent: EventEmitter <string> = new EventEmitter();
  @Output() checkBoxEvent: EventEmitter <string> = new EventEmitter();
  public isSaveDisabled:boolean = true;
  public CBComment:any = {
                          isSelected:false,
                          isEditable:true
                         };

  public isNomoveBtn:boolean = false;
  public isMasterOrder:boolean= false;
  public isConsolidateOrder:boolean= false;
  public showCommentCB : boolean = false;
  public disableComentCB:boolean = false;
  constructor(private localStorageService:LocalStorageService,
              private dialogService : DialogService,
              private router: Router,
              private utilsService : UtilsService,
              private rulesService:BusinessRulesService) { }

  ngOnInit() {
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
   
   }
   ngOnChanges(changes: SimpleChanges)
  {

    if(changes && changes.routingAgents &&   changes.routingAgents.currentValue !== undefined && changes.routingAgents.currentValue !==  changes.routingAgents.previousValue ) {
        this.checkAndUpdateSaveButton();
    }
    if(changes && changes.carrierList &&   changes.carrierList.currentValue !== undefined && changes.carrierList.currentValue !==  changes.carrierList.previousValue ) {
       this.checkAndUpdateSaveButton();
    }
    if(changes && changes.orderStatusModel &&   changes.orderStatusModel.currentValue !== undefined )
    {
       this.showCommentCB = this.orderStatusModel && (this.orderStatusModel.consolidation_Type == 'M'|| this.orderStatusModel.consolidation_Type == 'C' );
       this.isNomoveBtn = this.orderStatusModel.no_Move_Code == 'CL' || this.orderStatusModel.no_Move_Code == 'NM' ;
       const consolidation_Type = this.orderStatusModel.consolidation_Type;
       this.isMasterOrder = (consolidation_Type =='M')? true : false;
       this.isConsolidateOrder = (consolidation_Type =='C') ? true:false;
       this.disableComentCB = !this.isEditable('Update_Consolidated_Comments');
       console.log(' this.disableComentCB  : ', this.disableComentCB);
    }
   if(changes && changes.routingNotes &&   changes.routingNotes.currentValue !== undefined )
    {
      const consolidatedItem:any = this.routingNotes.find( item => item.routing_Note_Consolidated == true );
      this.CBComment.isSelected = (consolidatedItem)? true:false; 
      this.disableComentCB = !this.isEditable('Update_Consolidated_Comments');         
    }

  }

  showBookingClickHandler(event){
    if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrlToOperation`, this.router.url);
    const url = `view-booking/origin-destination-freight/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }

  consolidateClickHandler(event){
    if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
    const url = `operations/consolidateorder/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }

  statusClickHandler(event){
    if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
    const url = `operations/nomovestatus/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }
  field_repClickHandler(event) {
    if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
    const url = `operations/fieldservicerep/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }

  uploadClickHandler(event) {
      if(!this.utilsService.isOperationSaved()){
          this.showWarning();
          return false;
      }
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
      const tabId:any = this.getTabIdFromURL(this.router.url);
      const url = `operations/filemanager/${tabId}/${ApplicationService.instance.order_id}`;
      this.router.navigateByUrl(url);
    }

  showNotesClickHandler(event){
    if(!this.utilsService.isOperationSaved()){
      this.showWarning();
      return false;
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
    const url = `operations/notes/pickup-delivery-note/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
    }

  serviceFailClickHandler(event)
  {
    if(!this.utilsService.isOperationSaved()){
      this.showWarning();
      return false;
    }
    const tabId:any = this.getTabIdFromURL(this.router.url);
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:${tabId}_navigateUrl`, this.router.url);
    const url = `operations/service-failure/${tabId}/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }
   searchClickHandler(event){
    if(!this.utilsService.isOperationSaved()){
      this.showWarning();
      return false;
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
    const tabId:any = this.getTabIdFromURL(this.router.url);
    const url = `operations/customer-service-search/${tabId}/${ApplicationService.instance.order_id}`;
    this.router.navigateByUrl(url);
  }

  saveBtnClickHandler(event){
    this.clickEvent.emit('save');
  }

  getTabIdFromURL(url:any){
    const objTabId:any ={ pickup:'PU',delivery:'DEL',airline:'AL',}
    const type = url.split('/')[2];
    return objTabId[type];
  }
  showWarning(){
       const dialogRef = this.dialogService.showInfoPopup(Messages.WARNING_TITLE,Messages.OPERATION_NOT_SAVED);

      dialogRef.afterClosed().subscribe(result => {
        console.log('afterClose Event result : ', result);
        if (result && result.clickedOkay) {
        }
      });
   }
   closeClickHandler(event){
    const dialogRef = this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE,Messages.CONFIRM_CLOSE);

    dialogRef.afterClosed().subscribe(result => {
      console.log('afterClose Event result : ', result);
      if (result && result.clickedOkay) {
           this.localStorageService.clearAllkeys();
           //this.localStorageService.clearOrderData(ApplicationService.instance.booking_id)
          // this.localStorageService.clearBookingData(ApplicationService.instance.booking_id)
           this.router.navigateByUrl('dashboard');
       }
    });
   }

   checkAndUpdateSaveButton(){
     // console.log("this.carrierList======", this.carrierList);
    if(this.routingAgents && this.routingAgents.length > 0 && this.carrierList && this.carrierList.length>0){
        const carriers = this.carrierList.filter((item)=> item.carrier_Code !== "")
        const pickAgent:any = this.routingAgents.find(item=> item.pickup_Agent_Name != null);
        const deliveryAgent:any = this.routingAgents.find(item=> item.delivery_Agent_Name != null);
        if(pickAgent!= undefined && deliveryAgent !=undefined && carriers && carriers.length>0){
          this.isSaveDisabled = false;
        }
    }
    else {
      this.isSaveDisabled = true;
    }
  }

  commentsCheckBoxChange(event,CBComment){
    //console.log('event  : ',CBComment);
    this.checkBoxEvent.emit(CBComment);
  }

  private isEditable(fieldName) {
      if(this.showCommentCB) {          
         return this.rulesService.shouldEditable(fieldName);
       }
      return false;
  }
}
