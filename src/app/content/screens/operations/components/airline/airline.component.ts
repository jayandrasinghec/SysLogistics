import { Component, OnInit,OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service'; 
import { OperationsService } from 'src/app/services/operation.service';
import { Subscription } from 'rxjs/internal/Subscription';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { RoutingStatus } from 'src/app/core/models/routing-status.model';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-airline',
  templateUrl: './airline.component.html',
  styleUrls: ['./airline.component.scss']
})
export class AirlineComponent implements OnInit,OnDestroy {
  arrCarriersList:any[] =[];
  orderID:any;
  routingStatusOptions:any[]=[];
  airlineRoutingStatuses:any[]=[];
  routingStatus:any[]=[];
  arrNewCarrierList:any[]=[]; 
  commentSubscription:Subscription;
  statusSubscription:Subscription;
  carriersSubscription:Subscription;
  objComment:any;
  arrComments:any[] =[];
  arrRoutingStatus:any[] = [];
  routingStatusModel : RoutingStatus;
  isEditMode:boolean;

  constructor(private localStorageService: LocalStorageService, 
              private router:Router,
              private operationService: OperationsService, 
              private utilsService : UtilsService,
              private activatedRoute:ActivatedRoute,
              private dialogService : DialogService,
              private cd: ChangeDetectorRef) { 
         
         this.orderID = ApplicationService.instance.order_id;
        // this.getCarriersList(); // this API call wil hapens in tab.component
        // this.getRoutingStatuses(); // this API call wil hapens in tab.component
        //  this.getCarriersFromLS();   
           this.configComments();   
           this.configRoutingStatus();
           this.configCarrierList();
         console.log('activatedRoute.snapshot.paramMap.get: ',activatedRoute.snapshot.paramMap.get('orderid'));   

  }

   ngOnInit() {
   }
   ngOnDestroy(){
     console.log('ngOnDestroy AIrline');
     this.commentSubscription.unsubscribe();
     this.commentSubscription = null;
   }
  /* configSaveEvent(){
    this.saveSubscription = this.operationService.saveOperationEvent$.subscribe((result:any)=>{
      if(result && result=='save'){
        console.log('Save btn Clicked');
        this.saveOperations();
      }
    });
   }*/
   getCarriersList(){
    /*First check in the local storage if key available then fetch from local storage otherwise fetch from API*/
    const key = `${ApplicationService.instance.order_id}:carriersList`;
    // this.localStorageService.getData(key).subscribe((result:any)=>{
    //   if(result){
    //       this.arrCarriersList = result;
    //   } else{
         this.operationService.getOriginDestinationCarrierList(this.orderID).subscribe((response:any)=>{
          if(response.error){
            alert('Error - get order/routing/carrier-list');
            return false;
          }
          this.arrCarriersList = response.filter(element => element.carrier_Code !== null);
         // this.localStorageService.saveData(key,JSON.stringify( this.arrCarriersList));     
        });
    //   }
    // });
  }  
 configRoutingStatus(){
    this.statusSubscription = this.operationService.RoutingStatus$.subscribe((result:any)=>{
       if(result && result.length>0){
        console.log('Status  AVAILABLE PICKUP',result );
         this.airlineRoutingStatuses = result.filter(item => item.category == 'Airline').sort((a,b)  => a.display_order - b.display_order);; 

       }

    })
  }
 configCarrierList(){   
    this.carriersSubscription = this.operationService.carrierList$.subscribe((result:any)=>{
      if(result && result.length>0){
        console.log('Carrier list  AVAILABLE AIRLINE',result );
          this.arrCarriersList = result; 

       }
    })
  }
  
  checkBoxChange(event, routing){
    //const key = `${ApplicationService.instance.order_id}:Airline_RoutingStatus`;
    console.log('checkBoxChange', event, routing)
    if(routing.isSelected){
      let routingStatusCheckValidationData = JSON.parse(this.localStorageService.getItem('routingStatusCheckValidationData'));
      console.log('routingStatusCheckValidationData', routingStatusCheckValidationData)
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
        this.airlineRoutingStatuses.find(element => element.routing_code == routing.routing_code).isSelected = false; 
        routing.isSelected = false;
        const msg:any = {title: 'Validation Error', message: `Routing status selection is not in sequence. ` };
        this.showAlertMesage(msg);        
        return;
      }      
    }

    
    // if(!routing.isSelected && routing.routing_code != 'OHAIRPORT'){
    //   let routingStatusUnCheckValidationData = JSON.parse(this.localStorageService.getItem('routingStatusUnCheckValidationData'));
    //   console.log('routingStatusUnCheckValidationData', routingStatusUnCheckValidationData)
    //   let routing_statuses = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routingStatus`);
    //   let routingStatus = routing_statuses ? JSON.parse(routing_statuses) : new Array();
    //   if(routingStatus && routingStatus.length > 0 ){
    //     let value =  routingStatusUnCheckValidationData.find(i => i.key == routing.routing_code).value;
    //     const found = routingStatus.find(element => element.routing_Code == value);
    //     if(found)
    //     {
    //       this.cd.detectChanges();
    //       this.airlineRoutingStatuses.find(element => element.routing_code == routing.routing_code).isSelected = true; 
    //       const msg:any = {title: 'Validation Error', message: `Routing status un-selection is not in sequence. ` };
    //       this.showAlertMesage(msg);        
    //       return;
    //     }
    //   }
    // }

    //let routingStatusesCache = JSON.parse(this.localStorageService.getItem(key));
    //this.arrRoutingStatus =  routingStatusesCache && routingStatusesCache.length > 0 ? routingStatusesCache : [];
    this.routingStatusModel = new RoutingStatus();     
    this.routingStatusModel.created_by = 104;
    this.routingStatusModel. created_date= null;
    this.routingStatusModel.order_ID = ApplicationService.instance.order_id;
    this.routingStatusModel.routing_Code = routing.routing_code;
    this.routingStatusModel.category = 'Airline';
    /*this.routingStatusModel.routing_Code = routing.routing_code;
    if(routing.isSelected){         
          this.arrRoutingStatus.push(Object.assign({},routing));
    }
    else{      
      var indexToRemove = this.arrRoutingStatus.findIndex(i => i.routing_code == routing.routing_code);
      this.arrRoutingStatus.splice(indexToRemove, 1);
    }
    this.localStorageService.saveData(key ,JSON.stringify(this.arrRoutingStatus)); */
    this.operationService.updateRoutingStatuses([{'routingStatus':this.routingStatusModel, 'category' : 'Airline'}])
             
  }

  
  showAlertMesage(data: any){
    const dialogRef = this.dialogService.showInfoPopup(data.title,data.message);
  }

  /*------Fetch newly added Carriers from localStorage--------*/
  getCarriersFromLS(){
     this.localStorageService.getData(`${ApplicationService.instance.order_id}:carriers`).subscribe((result:any)=>{
        result = JSON.parse(result);
        if(result && result.carriers && result.carriers.length>0 ){
          this.arrNewCarrierList = this.parseNewCarrierList(result.carriers) ;
          this.operationService.updateRoutingDatas(this.arrNewCarrierList);
        }
     });
  }
   configComments(){
    /*fetch carriers from local storage and add new empty row after-*/    
    this.commentSubscription = this.operationService.commentsData$.subscribe((result:any)=>{
      console.log('COMMENTS AVAILABLE AIRLINE',result );
      this.arrComments =[];
      if(result &&result.length>0){
        const filteredComments = result.filter(item => item.note_type == 'Airline');
        this.arrComments = this.arrComments.concat(filteredComments);
        this.arrComments.map(item=> item.canEdit = (item.comment =='' )?true:false  );
        console.log(' this.this.arrComments ', this.arrComments );       
      }  
      console.log(' this.arrComments ', this.arrComments );
      this.arrNewCarrierList=[];          

    });   
  }
  parseNewCarrierList(carriers:any) {
    const arrCarriers:any =[];
      for(const item of carriers){
        let objItem:any = {
          airbill_number: item.airBillNumber,
          carrier_code: item.carrierCode,
          carrier_service_level_code: item.carrierServiceLevelCode,
          comment: "",
          created_by: item.createdBy,          
          note_type: "Airline",
          order_ID: item.orderId,
          routing_Note_ID: 0,
          statusCode: "I",
          isEdit : false,
          id:''
        }
        arrCarriers.push(objItem);
      }
      return arrCarriers;
  }

  editCommentClickHandler(row,i){
    row.isEdit = true;
  }
  focusOutFunction(row,i){
     row.isEdit = false;
     row.id = (row.id && row.id != '')? row.id:  `Airline_${i}`;
     row.statusCode =(row.statusCode == 'I')?'I':'U';
     this.operationService.updateRoutingDatas([row]);
  }

  subBtnClickhandler(event){
    /*if(!this.utilsService.isOperationSaved()){
        this.showWarning();
        return false;
    }*/
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`,this.router.url);
    this.router.navigateByUrl(`operations/airline/carriers/${ApplicationService.instance.order_id}`);
  }


   getFormattedDate(dateTime){
     return this.utilsService.getDisplayDate(dateTime);
   }
   getFormattedTime(dateTime){
     return this.utilsService.getDisplayTime(dateTime);
   }
   showWarning(){
       const dialogRef = this.dialogService.showInfoPopup(Messages.WARNING_TITLE,Messages.OPERATION_NOT_SAVED);

      dialogRef.afterClosed().subscribe(result => {
        console.log('afterClose Event result : ', result);
        if (result && result.clickedOkay) {
          
                  
        }
      });
   }
   pieceBtnClickhandler(event){
        if(!this.utilsService.isOperationSaved()){
          this.showWarning();
          return false;
        }
        const tabId:any = this.getTabIdFromURL(this.router.url);
        this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
        this.router.navigateByUrl(`operations/actualweight/${tabId}/${ApplicationService.instance.order_id}`);
   }
   dimBtnBtnClickhandler(event){
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
   
  getuserName(userId) 
  {
    return userId == AuthService.getInstance().userId ? AuthService.getInstance().userName : userId;
  }
    
  getTabIdFromURL(url:any){
        const objTabId:any ={ pickup:'PU',delivery:'DEL',airline:'AL',}
        const type = url.split('/')[2];
        return objTabId[type];
 }

 public commentChangehandler(row, event){
  row.comment = event;
}
}
