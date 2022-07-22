import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { ApplicationService } from 'src/app/services/application.service';
import { OperationsService } from 'src/app/services/operation.service';
import AuthService from 'src/app/services/auth.service';
import { Subscription } from 'rxjs/internal/Subscription';
import {RoutingNote} from 'src/app/core/models/routing-note.model';
import { UtilsService } from 'src/app/services/Utils.service';
import { RoutingStatus } from 'src/app/core/models/routing-status.model';
import { Subject, forkJoin } from 'rxjs';
import { Messages } from 'src/app/common/Messages';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.component.html',
  styleUrls: ['./pickup.component.scss']
})
export class PickupComponent implements OnInit {

  arrCarriersList:any[] =[];
  routingStatusOptions:any[]=[];
  pickupRoutingStatuses:any[]=[];
  isEditPOP:boolean = false;
  routingStatus:any[]=[];
  orderCustomerNotifications:any;
  orderID:any;
  arrComments:any[] =[];
  arrRoutingStatus:any[] = [];
  objComment:any;
  commentSubscription:Subscription;
  statusSubscription:Subscription;
  carriersSubscription:Subscription;
  routingDetailSubscription:Subscription;
  routingStatusModel : RoutingStatus;
  isEditMode:boolean;
  public routingDetailStatus: string = '';
  private destory$ = new Subject();

  constructor(private router:Router,
              private localStorageService:LocalStorageService,
              private operationService: OperationsService,
              private utilsService : UtilsService,
              private dialogService : DialogService,
              private cd: ChangeDetectorRef) {   
      this.orderID = ApplicationService.instance.order_id;
     // this.getCarriersList();  // this API call wil hapens in tab.component
     // this.getRoutingStatuses();    // this API call wil hapens in tab.component   
      this.configComments();
      this.configRoutingStatus();
      this.configCarrierList();
      this.getOrderRoutingConfig();
      //this.configRoutingStatuDetail();    
      //this.getNotificationMapping();

  }

  ngOnInit() {

  }

  ngOnDestroy(){
    this.commentSubscription.unsubscribe();
    this.destory$.next();
  }

  configComments(){
    /*Needs to fetch comments and add new empty row after-*/
    this.commentSubscription = this.operationService.commentsData$.subscribe((result:any)=>{
      if(result){

        this.arrComments = (result.length>0)? result.filter(item => item.note_type == 'P/U'):[];
        //this.arrComments.map(item=> item.canEdit = (item.comment =='')?true:false  );
        this.objComment = new RoutingNote;
        this.objComment.note_type= "P/U";
        this.objComment.created_by = AuthService.getInstance().userId;
        this.objComment.order_ID = this.orderID;
        this.objComment.statusCode= "I";
        this.objComment.isEdit = false;
        this.objComment.id='';
        this.objComment.comment='';
         this.objComment.airbill_number=null;
        this.objComment.carrier_code=null;
        this.objComment.carrier_service_level_code=null;
	      this.objComment.routing_Note_Consolidated = false;
        this.arrComments.push(Object.assign({},this.objComment));
      }    
   });   
  }
  configRoutingStatus(){
    this.statusSubscription = this.operationService.RoutingStatus$.subscribe((result:any)=>{
       if(result && result.length>0){
         this.pickupRoutingStatuses = result.filter(item => item.category == 'P/U').sort((a,b)  => a.display_order - b.display_order);          
         this.isEditPOP = this.pickupRoutingStatuses.find(item => item.routing_code == 'PUCOMP').isSelected;
       }
    });

    this.operationService.RoutingDetailStatus$
    .pipe(takeUntil(this.destory$))
    .subscribe((result:any)=>{
      if(result){
        this.routingDetailStatus = result.POP;

      }
   })
  }

  configCarrierList(){   
    this.carriersSubscription = this.operationService.carrierList$.subscribe((result:any)=>{
      if(result && result.length>0){
          this.arrCarriersList = result; 

       }
    })
  }

  getCarriersList(){
    /*First check in the local storage if key available then fetch from local storage otherwise fetch from API*/
    const key = `${ApplicationService.instance.order_id}:carriersList`;
    // this.localStorageService.getData(key).subscribe((result:any)=>{
    //   if(result){
    //       this.arrCarriersList = result;
    //   } else{
         this.operationService.getOriginDestinationCarrierList(this.orderID).subscribe((response:any)=>{
          if(response.error){
            alert('Error - order/routing/carrier-list?orderid=');
            return false;
          }
          this.arrCarriersList = response.filter(element => element.carrier_Code !== null);
         // this.localStorageService.saveData(key ,JSON.stringify( this.arrCarriersList));     
        });
    //   }
    // });
  }
  
  getOrderRoutingConfig(){
    const key = `${ApplicationService.instance.order_id}:OrderRoutingConfig`;
    this.operationService.getOrderRoutingConfig(ApplicationService.instance.order_id).subscribe((response:any)=>{
            if(response.error){
              alert('Error - routing/notification/config?orderid=');
              return false;
            }
            this.localStorageService.saveData(key, JSON.stringify(response));
            //this.orderCustomerNotifications = response;         
          });        
   
  }

  configRoutingStatuDetail(){
    this.routingDetailSubscription = this.operationService.RoutingDetailStatus$.subscribe((result:any)=>{
      if(result){               
        this.routingDetailStatus = result.POP;

      }

   })
  }

  
  // getNotificationMapping(){
  //   this.operationService.getNotificationMapping().subscribe((response:any)=>{
  //     if(response.error){
  //       alert('Error');
  //       return false;
  //     }
  //     this.localStorageService.saveData(`${ApplicationService.instance.order_id}:NotificationMapping`, JSON.stringify(response));
  //     //this.orderCustomerNotifications = response;         
  //   });
  // }
 
/*-------------------------*/
  editCommentClickHandler(row,i){
    row.isEdit = true;
  }
  focusOutFunction(row,i){
     
    if( row.comment.trim() !==''){   
        row.isEdit = false;    
        row.id = (row.id && row.id != '')? row.id:  `P/U_${i}`;
        row.statusCode =(row.statusCode == 'I')?'I':'U';
        this.operationService.updateRoutingDatas([row]);
        const lastRow = this.arrComments[(this.arrComments.length-1)];
        if(lastRow && lastRow.comment !==''){
          this.arrComments.push(Object.assign({},this.objComment));
        }
     } 
  }

  checkBoxChange(event, routing){
    this.isEditPOP = (routing.routing_code == 'PUCOMP') ? routing.isSelected : this.isEditPOP;
    if(routing.isSelected && routing.routing_code != 'PUSCHD'){
    let routingStatusCheckValidationData = JSON.parse(this.localStorageService.getItem('routingStatusCheckValidationData'));
    let routing_statuses = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routingStatus`);
    let routingStatus = routing_statuses ? JSON.parse(routing_statuses) : new Array();
    let values =  routingStatusCheckValidationData.find(i => i.key == routing.routing_code).value;
    let isValid : boolean = true;
    if(values && values.length> 0)
    {      
      for(let value of values)
      {
        if((routingStatus && routingStatus.length > 0) && routingStatus.find(element => element.routing_Code == value))
        {
          isValid = true;
        }
        else
        {
          isValid = false;
          break;
        }
      }
    }
    //const found = (routingStatus && routingStatus.length > 0) ? routingStatus.find(element => element.routing_Code == value) : false;
    if(!isValid)
    {    
      this.cd.detectChanges();  
      this.pickupRoutingStatuses.find(element => element.routing_code == routing.routing_code).isSelected = false; 
      this.isEditPOP = (routing.routing_code == 'PUCOMP') ? false : this.isEditPOP; 
      const msg:any = {title: 'Validation Error', message: `Routing status selection is not in sequence. ` };
      this.showAlertMesage(msg);        
      return;
    }    
  }

    if(!routing.isSelected){
    let routingStatusUnCheckValidationData = JSON.parse(this.localStorageService.getItem('routingStatusUnCheckValidationData'));
    let routing_statuses = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routingStatus`);
    let routingStatus = routing_statuses ? JSON.parse(routing_statuses) : new Array();
    if(routingStatus && routingStatus.length > 0){
      //let value =  routingStatusUnCheckValidationData.find(i => i.key == routing.routing_code).value;
      //const found = routingStatus.find(element => element.routing_Code == value);
      //if(found)
      let values =  routingStatusUnCheckValidationData.find(i => i.key == routing.routing_code).value;
      let isValid : boolean = false;
      if(values && values.length> 0)
      {      
        for(let value of values)
        {
          if(routingStatus.find(element => element.routing_Code == value))
          {
            isValid = true;
            break;
          }         
        }
      }
      //const found = (routingStatus && routingStatus.length > 0) ? routingStatus.find(element => element.routing_Code == value) : false;
      if(isValid)
      {
        this.cd.detectChanges();
        this.pickupRoutingStatuses.find(element => element.routing_code == routing.routing_code).isSelected = true;
        this.isEditPOP = (routing.routing_code == 'PUCOMP') ? true : this.isEditPOP;
        const msg:any = {title: 'Validation Error', message: `Routing status un-selection is not in sequence. ` };
        this.showAlertMesage(msg);        
        return;
      }
    }
  }

    this.routingStatusModel = new RoutingStatus();     
    this.routingStatusModel.created_by = 104;
    this.routingStatusModel. created_date= null;
    this.routingStatusModel.order_ID = ApplicationService.instance.order_id;
    this.routingStatusModel.routing_Code = routing.routing_code;
    this.routingStatusModel.category = 'P/U';
   /* if(routing.isSelected){         
          this.arrRoutingStatus.push(Object.assign({},routing));
    }
    else{      
      var indexToRemove = this.arrRoutingStatus.findIndex(i => i.routing_code == routing.routing_code);
      this.arrRoutingStatus.splice(indexToRemove, 1);
    }
    this.localStorageService.saveData(key ,JSON.stringify(this.arrRoutingStatus)); */
    this.operationService.updateRoutingStatuses([{'routingStatus':this.routingStatusModel, 'category' : 'P/U'}])
             
  }

  showAlertMesage(data: any){
    const dialogRef = this.dialogService.showInfoPopup(data.title,data.message);
  }
  

/*-------------SUB BUTON CLICK HANDLERS---------------*/
  actualWeightClickHandler(event) {
      if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
      }
      const tabId:any = this.getTabIdFromURL(this.router.url);
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
      this.router.navigateByUrl(`operations/actualweight/${tabId}/${ApplicationService.instance.order_id}`);
  }
    addDimsClickHandler(event) {
        if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
        }
        let operationOrder = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`)
        operationOrder = JSON.parse(operationOrder);
        const bookingId = operationOrder['booking_ID'];
        const orderId = ApplicationService.instance.order_id;
        const tabId:any = this.getTabIdFromURL(this.router.url);
        this.localStorageService.saveData(`${bookingId}:navigateUrl`, this.router.url);
        this.router.navigateByUrl(`operations/calculatediamensions/${tabId}/${orderId}/${bookingId}`);
      }

    specialChargesClickHandler(event){
        if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
        }
        let operationOrder = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`)
        operationOrder = JSON.parse(operationOrder);
        const bookingId = operationOrder['booking_ID'];
        const orderId = ApplicationService.instance.order_id;
        this.localStorageService.saveData(`${bookingId}:navigateUrl`, this.router.url);
        this.localStorageService.saveData(`${bookingId}:tariff_ID`, operationOrder['tariff_ID']);
        this.localStorageService.saveData(`${bookingId}:shipper_zone`, operationOrder['origin_Zone'])
        this.router.navigateByUrl(`operations/specialcharges/${orderId}/${bookingId}/shipper`);
       }
       labelClickHandler(event){
       if(!this.utilsService.isOperationSaved()){
          this.showWarning();
          return false;
      }
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
      const tabId:any = this.getTabIdFromURL(this.router.url);
      const url = `operations/label/${tabId}/${ApplicationService.instance.order_id}`;
      this.router.navigateByUrl(url);
       }
      alertClickHandler(event){
       if(!this.utilsService.isOperationSaved()){
          this.showWarning();
          return false;
      }
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
      const tabId:any = this.getTabIdFromURL(this.router.url);
      const url = `operations/alert/${tabId}/${ApplicationService.instance.order_id}`;
      this.router.navigateByUrl(url);
       }
      changeAgentClickHandler($event){
          /*if(!this.utilsService.isOperationSaved()) {
            this.showWarning();
            return false;
           }*/
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
      const tabId:any = this.getTabIdFromURL(this.router.url);
      const url = `operations/change_agent/${tabId}/${ApplicationService.instance.order_id}`;
      this.router.navigateByUrl(url);
       }

    /*-------------SUB BUTON CLICK HANDLERS---------------*/
    getTabIdFromURL(url:any){
        const objTabId:any ={ pickup:'PU',delivery:'DEL',airline:'AL',}
        const type = url.split('/')[2];
        return objTabId[type];
     }
     getFormattedDate(dateTime){
     return this.utilsService.getDisplayDate(dateTime);
   }
   getFormattedTime(dateTime){
     return this.utilsService.getDisplayTime(dateTime);
   }
   
   proofOfPickupClickHandler(event) {
    if(!this.utilsService.isOperationSaved()){
      this.showWarning();
      return false;
    }
    
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:POP_navigateUrl`, this.router.url);
    this.router.navigateByUrl(`operations/proof-of-pickup/POP/${ApplicationService.instance.order_id}`);
  }

   showWarning(){
       const dialogRef = this.dialogService.showInfoPopup(Messages.WARNING_TITLE,Messages.OPERATION_NOT_SAVED);

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
          
                  
        }
      });
   }
    
  getuserName(userId) 
  {
    return userId == AuthService.getInstance().userId ? AuthService.getInstance().userName : userId;
  }

  public commentChangehandler(row, event){
    row.comment = event;
  }
}
