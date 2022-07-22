import { Component, OnInit, ViewEncapsulation,ViewChild } from '@angular/core';
import {OrderSearchService} from '../../../../../services/order-search.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router,RouterOutlet,ActivationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { ApplicationService } from 'src/app/services/application.service';
import {ModelService} from 'src/app/services/model.service';
import { OperationsService } from 'src/app/services/operation.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UtilsService } from 'src/app/services/Utils.service';
import {MenuButtonService} from '../../../../../services/menu.service';
import AuthService from '../../../../../services/auth.service';
import { RoutingService } from 'src/app/services/routing.service';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
import { forkJoin, of, Subject } from 'rxjs';
import { Messages } from 'src/app/common/Messages';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
  public navTabs: any[];
  public operationModel:any; // model data
  public searchModel:any;
  public agent_name:any;
  public routingAgents:any[];
  private activeTabIndex:any =0;
  public routingData: any[]=  new Array();
  private routingStatus: any[];
  private routingLog: any[];
  private operationOrderID:any;
  private routingStatusOptions:any[];
  private previousOrderId: any;
  public arrCarriersList:any[]=[];

  private subscription:Subscription;
  private routingStatusSubscription:Subscription;
  private routerSubscription:Subscription;
  private menuEventSubscription:Subscription;
  private destroy$ = new Subject();
  public orderStatusModel:any;
  public isUpdate_Consolidated_Comments:boolean = false;
  @ViewChild('orderid', {static: false}) ipOrderid: any;
  @ViewChild('airbilno', {static: false}) ipAirbilno: any;
  @ViewChild(RouterOutlet, {static: false}) outlet: RouterOutlet;

  constructor(private orderSerchService: OrderSearchService,
              private localStorageService: LocalStorageService,
              private modelService:ModelService,
              private operationService:OperationsService,
              private router:Router,
              private routerService : RoutingService,
              private activatedRoute : ActivatedRoute,
              private utilsService:UtilsService,
              private dialogService : DialogService,
              private rulesService: BusinessRulesService
            ) { 
              
            }

  ngOnInit() {
  
    this.operationOrderID = (this.router.url.split('/').length==4)?this.router.url.split('/')[3]:null ; // getting  from URL
   
    this.configRoutingEvent()
    this.configSearchModel();
    this.configTabs();
    this.configOperationModel();   
    this.configOrderStatusModel();
    this.configRoutingDataSubscription();
    this.configRoutingStatusSubscription(); 
    // this.configMenuEventSubscription();   
   if(this.operationOrderID){
      this.getRoutingNotes();
      this.getRoutingStatusOptions();
      this.getCarriersList(); 
    //  this.getPickupDeliveryAgent();
      this.deleteLocalStorageKeys();  
      this.getRoutingDetailStatus();
      this.getRoutingAgent();
      this.previousOrderId = this.operationOrderID;
    }
    // this.operationService.RoutingStatus$.subscribe((data:any) => {
    //   if(data && data.length){
    //     this.getRoutingAgent();
    //   }      
    // });
    /*this.router.events.subscribe(e => {
      if (e instanceof ActivationStart && this.outlet)
        this.outlet.deactivate();
    });*/
    console.log('ApplicationService.instance.order_id  : ',ApplicationService.instance.order_id);
  }
  deleteLocalStorageKeys(){
    this.localStorageService.clear(`${this.operationOrderID}:navigateUrlToOperation`);
  }

  getRoutingDetailStatus(){
    this.operationService.getRoutingDetail(ApplicationService.instance.order_id).subscribe((response : any) => {
      let popRoutingDetailStatus : any = '';
      let podRoutingDetailStatus : any = '';
      
      if(response)
      {
        let popModel = response.find(i => i.type == 'POP' && i.deleted_Date == null);
        if(popModel){
          popRoutingDetailStatus = 'D';
        }
        let podModel = response.find(i => i.type == 'POD' && i.deleted_Date == null);
        if(podModel){
          podRoutingDetailStatus = 'D';
        }
        this.operationService.getRoutingAttachment(ApplicationService.instance.order_id).subscribe((response : any) => {
          if(response)
            {
              let popAttachmentList = response.filter(i => i.type == 'POP' && i.deleted_Date == null);
              if(popAttachmentList && popAttachmentList.length > 0)
              {
                popRoutingDetailStatus = 'A';  
              }

              let podAttachmentList = response.filter(i => i.type == 'POD' && i.deleted_Date == null);
              if(podAttachmentList && podAttachmentList.length > 0)
              {
                podRoutingDetailStatus = 'A';  
              }
          }
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:POP_routingDetailStatus`, popRoutingDetailStatus); 
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:POD_routingDetailStatus`, podRoutingDetailStatus); 
          this.operationService.emitRoutingDetailStatus({'POP' : popRoutingDetailStatus, 'POD' : podRoutingDetailStatus})
        })

      }
      
    })       
  }

  ngOnDestroy(): void {
    if (this.router.url.indexOf('POP') === -1 && this.router.url.indexOf('POD') === -1){
      this.routingStatusSubscription.unsubscribe();
      this.routingStatusSubscription=null;
      
      this.routerSubscription.unsubscribe(); 
      this.routerSubscription =null;
      this.subscription.unsubscribe(); 
      this.subscription = null;
      this.destroy$.next();
    }
  }

  configMenuEventSubscription():void{
  this.menuEventSubscription =   MenuButtonService.instance.menuButtonEvent$.subscribe((result:any)=>{
        if(result == 'operations'){
           ApplicationService.instance.order_id = null;
           this.operationModel = null;
           this.operationOrderID = '';
           this.searchModel.orderId='';
           this.modelService.modelUpdated(this.operationModel);
           this.outlet.deactivate();
        }
    });
  }

 configRoutingEvent(): void{
     this.routerSubscription =  this.router.events.subscribe((event: any) => {       
              if (event instanceof NavigationEnd) {
                  if(event.urlAfterRedirects == '/operations' &&  event.url == '/operations'){
                          this.routerSubscription.unsubscribe();
                          this.routingStatusSubscription.unsubscribe();
                          this.routingStatusSubscription=null;
                          ApplicationService.instance.order_id = null;
                          this.operationModel = null;
                          this.operationOrderID = '';
                            this.searchModel.orderId='';
                          this.modelService.modelUpdated(this.operationModel);
                          this.ngOnInit();
                  }
            }
      });
     
  }
  
  configSearchModel(){
    this.searchModel = {orderId:'', airbillNo:''}
  }
  /* configuration for navigation Tabs*/
  configTabs(){
    this.navTabs = [
      {   label: 'Pickup',
          link: 'operations/pickup/%orderId%', index: 0,
          isActive: false,
          isDisabled: false,
          isFormEditable:false
        },
      {
          label: 'Delivery',
          link: 'operations/delivery/%orderId%', index: 1,
          isActive: false, isDisabled: false,
          isFormEditable:false },
      {
          label: 'Airline/Linehaul',
          link: 'operations/airline/%orderId%', index: 2,
          isActive: false, isDisabled: false,
          isFormEditable:false
      }

    ];
  }
  configOperationModel(){
    if(ApplicationService.instance.order_id){
      this.localStorageService.getDataByOrderId('operation_order').subscribe((response)=>{
        if(response){
          this.operationModel = JSON.parse(response);
          this.modelService.modelUpdated(this.operationModel);
          this.setActiveIndexOnLoad(this.router.url)  ;
        }
      });
    }

  }

getRoutingNotes(){
     let arrCarriersList:any;
     //let routingNotes:any=  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routing_notes`)
     //routingNotes = (routingNotes)? JSON.parse(routingNotes):[];
     //console.log('routingNotes LS  ',routingNotes);
     this.operationService.getCareersAndRoutingNotes(this.operationModel.order_ID).subscribe((response:any)=>{
       if(response.error){
         alert('Error - get orders/${orderId}/carriers');
       }
       arrCarriersList = response.careers.carriers ;  
       arrCarriersList = this.parseNewCarrierList(arrCarriersList);  
       this.routingData = response.notes ;  
       this.isUpdate_Consolidated_Comments = this.routingData.find(item => item.routing_Note_Consolidated == true) != undefined ;
        //console.log('this.routingData  ',this.routingData);      
       this.routingData = this.UpdateRoutingNotes( this.routingData,arrCarriersList) ;
       this.operationService.updateCommentsDatas(this.routingData);
      // this.localStorageService.saveData(`${ApplicationService.instance.order_id}:routing_notes`,JSON.stringify(this.routingData));
     });

}
           
UpdateRoutingNotes( routingData,arrNewCarrierList) {
    for(const item of arrNewCarrierList){
      const routingId:any = item.routing_ID;
      const found:any = routingData.find(item => item.routing_ID ==routingId );
      if(found   ){
        const index = routingData.indexOf(found);
        routingData[index].airbill_number = item.airbill_number;
        routingData[index].carrier_code = item.carrier_code;
        routingData[index].carrier_service_level_code = item.carrier_service_level_code;
        routingData[index].routing_ID = item.routing_ID;
       // routingData[index].statusCode = 'U';
        routingData[index].upated_by = AuthService.getInstance().userId;        
      }
      else{
        routingData.push(item);
      }
    }
    return routingData;
  }
  getRoutingStatusOptions(){
     
      /*First check in the local storage if key available then fetch from local storage otherwise fetch from API*/
      const key = `${ApplicationService.instance.order_id}:routingStatusOptions`;
      this.localStorageService.getData(key).subscribe((result:any)=>{
        if(result){
            this.routingStatusOptions = JSON.parse(result);
            this.getRoutingStatus();
        } else{
          this.operationService.getRoutingStatusOptions().subscribe((response:any)=>{
            if(response.error){
              alert('Error - get reference/utilities/routing-status');
              return false;
            }
            this.routingStatusOptions = response;  
            let routingStatusUnCheckValidationData = 
            // [
            //   {key : 'PUSCHD' , value : 'PUCNFM'},
            //   {key : 'PUCNFM' , value : 'PUCOMP'},
            //   {key : 'PUCOMP' , value : 'DELSCHD'},
            //   {key : 'DELSCHD' , value : 'OHHOLD'},
            //   {key : 'OHHOLD' , value : 'OUTFRDEL'},
            //   {key : 'OUTFRDEL' , value : 'TRROUTED'},
            //   {key : 'TRROUTED' , value : 'COBTRAN'},
            //   {key : 'COBTRAN' , value : 'OHAIRPORT'},
            // ];
            [
              {key : 'PUSCHD' , value : ['PUCNFM']},
              {key : 'PUCNFM' , value : ['PUCOMP']},
              {key : 'PUCOMP' , value : ['OHHOLD', 'OUTFRDEL', 'TRROUTED','COBTRAN','OHAIRPORT']},
              // {key : 'DELSCHD' , value : []},
              // {key : 'OHHOLD' , value : []},
              // {key : 'OUTFRDEL' , value : []},
              // {key : 'TRROUTED' , value : []},
              // {key : 'COBTRAN' , value : []},
            ];
            
           let routingStatusCheckValidationData = 
          //  [
          //   {key : 'OHAIRPORT' , value : 'COBTRAN'},            
          //   {key : 'COBTRAN' , value : 'TRROUTED'},
          //   {key : 'TRROUTED' , value : 'OUTFRDEL'},
          //   {key : 'OUTFRDEL' , value : 'OHHOLD'},
          //   {key : 'OHHOLD' , value : 'DELSCHD'}, 
          //   {key : 'DELSCHD' , value : 'PUCOMP'},   
          //   {key : 'PUCOMP' , value : 'PUCNFM'},        
          //   {key : 'PUCNFM' , value : 'PUSCHD'},               
          //  ];
          [
            {key : 'OHAIRPORT' , value : ['PUSCHD','PUCNFM','PUCOMP']},            
            {key : 'COBTRAN' , value : ['PUSCHD','PUCNFM','PUCOMP']},
            {key : 'TRROUTED' , value : ['PUSCHD','PUCNFM','PUCOMP']},
            {key : 'OUTFRDEL' , value : ['PUSCHD','PUCNFM','PUCOMP','TRROUTED','COBTRAN']},
            {key : 'OHHOLD' , value : ['PUSCHD','PUCNFM','PUCOMP','TRROUTED','COBTRAN']}, 
            {key : 'DELSCHD' , value : []},   
            {key : 'PUCOMP' , value : ['PUCNFM', 'PUSCHD']},        
            {key : 'PUCNFM' , value : ['PUSCHD']},               
          ];

           this.localStorageService.saveData('routingStatusCheckValidationData', JSON.stringify(routingStatusCheckValidationData));
           this.localStorageService.saveData('routingStatusUnCheckValidationData', JSON.stringify(routingStatusUnCheckValidationData));
             this.getRoutingStatus();            
          });
        }   
      });
      
     
  }
  getRoutingStatus(){
     const key_options = `${ApplicationService.instance.order_id}:routingStatusOptions`;
    const key = `${ApplicationService.instance.order_id}:routingStatus`;
     this.localStorageService.getData(key).subscribe((result:any)=>{
         if(result){
               this.routingStatus = JSON.parse(result);
               if(this.routingStatus.length>0){
                    for(let item of this.routingStatusOptions){
                            let item_filtered = this.routingStatus.filter(i => i.routing_Code == item.routing_code);                             
                            item.isSelected = (item_filtered && item_filtered.length > 0) ? true : false;
                            item.isEditable = (item_filtered && item_filtered.length > 0 && item_filtered[0].created_date != null)   ? true : false;
                          }
               }
               this.operationService.emitRoutingStatus(this.routingStatusOptions);
         }
         else{
              this.operationService.getRoutingStatus(ApplicationService.instance.order_id).subscribe((result:any) => {
                 if(result.error){
                    alert('Error - get reference/utilities/routing-status');
                    return false;
                  }
                  this.routingStatus = result;
                    if( this.routingStatus.length>0){
                        for(let item of this.routingStatusOptions){
                            let item_filtered = this.routingStatus.filter(i => i.routing_Code == item.routing_code); 
                            //console.log('item_filtered ',item_filtered);                            
                            item.isSelected = (item_filtered && item_filtered.length > 0) ? true : false;
                            item.isEditable = (item_filtered && item_filtered.length > 0 && item_filtered[0].created_date != null)   ? true : false;


                          }
                    }
                    this.localStorageService.saveData(key ,JSON.stringify( this.routingStatus));  
                    this.localStorageService.saveData(key_options ,JSON.stringify( this.routingStatusOptions));  
                    this.operationService.emitRoutingStatus(this.routingStatusOptions);
                    // this.routerService.updateRoutingStatus$.next( this.routingStatusOptions);
              });
         }
     });     
  }
  getCarriersList(){
    /*First check in the local storage if key available then fetch from local storage otherwise fetch from API*/
    const key = `${ApplicationService.instance.order_id}:carriersList`;
    // this.localStorageService.getData(key).subscribe((result:any)=>{
    //   if(result){
    //       this.arrCarriersList = result;
    //   } else{
         this.operationService.getOriginDestinationCarrierList(ApplicationService.instance.order_id).subscribe((response:any)=>{
          if(response.error){
            alert('Error - order/routing/carrier-list?orderid=');
            return false;
          }
          this.arrCarriersList = response.filter(element => element.carrier_Code !== null);
          if( this.arrCarriersList  &&  this.arrCarriersList.length ==0){
              const objDefault:any = {
                carrier_Code:'',
                carrier_Service_Level_Code:'',
                airBill_Number:'',
                hawb_No:'',
                origin_Air_Code: this.operationModel.origin_Air_Code,
                dest_Air_Code:this.operationModel.dest_Air_Code,
                pieces:this.operationModel.pieces,
                weight_Actual_LB:this.operationModel.weight_Actual_LB,
                weight_Dimensional_LB:this.operationModel.weight_Dimensional_LB,
                declared_Value:this.operationModel.declared_Value
              }
              this.arrCarriersList.push(objDefault);
          }
          this.operationService.emitCarrierList(this.arrCarriersList);
         // this.localStorageService.saveData(key ,JSON.stringify( this.arrCarriersList));     
        });
    //   }
    // });
  }    

 /* generateOrderRoutingLog(routing_code:any, category: any){
    let orderRoutingLogs = [];
    this.localStorageService.getData(`${ApplicationService.instance.order_id}:OrderRoutingConfig`).subscribe((result) => {
      if(result)
      {
        let orderRoutingConfigs = JSON.parse(result);
        if(orderRoutingConfigs.length > 0)
          {
             //case 1  If cn.Notify_Customer_Flag = 1, Setup this option when nm.Routing_Code = Routing Code
             let case1Config = orderRoutingConfigs.find(config => config.routing_Code == routing_code && config.notify_Customer_Flag ==true);
            if(case1Config != undefined){
              orderRoutingLogs.push(this.getOrderRoutingLog(case1Config, routing_code, category,'CLN')); 
            }
            //case 2  IF cn.Pickup_Reminder_Flag = 1 , Setup this option for Only Pickup Routing Codes.
            let case2Config:any = orderRoutingConfigs.find(config => config.pickup_Reminder_Flag == true);
            if(case2Config != undefined && category == "P/U"){
                orderRoutingLogs.push(this.getOrderRoutingLog(case2Config, routing_code, category,'PUR')); 
            }
            // case 3  If cn.Notify_Booking_Agent_Flag = 1, Setup this option for all Routing Codes for Pickup, Delivery, and Airline/Linehaul
            let case3Config:any = orderRoutingConfigs.find(config => config.notify_Booking_Agent_Flag == true);
            if(case3Config){
              orderRoutingLogs.push(this.getOrderRoutingLog(case3Config, routing_code, category,'BAG')); 
            }
            // Need to do nothing this scenario is for Rating screen          
            // if(orderRoutingConfig.notify_Customer_Flag && orderRoutingConfig.final_invoice_flag)
            // {                
            // }
          }
      }
    })    
    return orderRoutingLogs;
  }

  getOrderRoutingLog(orderRoutingConfig:any, routing_code:any, category : any,recType:any){
    let orderRoutingLog = new OrderRoutingLog();    
    orderRoutingLog.created_By = AuthService.getInstance().userId;
    orderRoutingLog.deleted_By = null;
    orderRoutingLog.email_Log_ID = null;
    orderRoutingLog.notification_Config_ID =  orderRoutingConfig.notification_Config_ID ;
    orderRoutingLog.order_ID = this.operationModel.order_ID;
    orderRoutingLog.routing_Code = routing_code;
    orderRoutingLog.sent_By = null;
    orderRoutingLog.sent_Date = null;
    orderRoutingLog.status_Date = null;
    orderRoutingLog.status_Message = null;
    orderRoutingLog.recipient_Type = recType;
    orderRoutingLog.email_Address = this.getEmailAddressFromConfig(orderRoutingConfig,recType);
    orderRoutingLog.attention = (recType =='CLN')?orderRoutingConfig.client_Attention:null;
    orderRoutingLog.sendPic = 0;
    return orderRoutingLog;
  }*/
 
  /*--subscribe the comments from tabs and add it in routingData--*/
  configRoutingDataSubscription(){
    this.subscription = this.operationService.updateRoutingData$.subscribe((result:any)=>{
      if(result && result.length>0){            
          for(let item of result){ 
            const found = this.routingData.find(element => element.id == item.id);
            if(!found  ){
              this.routingData.push(item);
            }else{
                const index = this.routingData.indexOf(found);
                this.routingData[index] = item ;
            }
          }
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:routing_notes`,JSON.stringify(this.routingData));
      }
    });
   }

   /*--subscribe the routing status from tabs and add it in routingStatus--*/
  configRoutingStatusSubscription(){
    this.routingStatusSubscription = this.operationService.updateRoutingStatus$.subscribe((result:any)=>{
      if(result && result.length>0){   
      let routing_statuses = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routingStatus`);
      this.routingStatus = routing_statuses ? JSON.parse(routing_statuses) : new Array();
      let routing_logs = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routingLog`);
      this.routingLog = routing_logs ? JSON.parse(routing_logs) : new Array();
               
          for(let item of result)
          { 
            const found = this.routingStatus.find(element => element.routing_Code == item.routingStatus.routing_Code);               
            console.log(' found  ',found); 
            if(!found ){
              this.routingStatus.push(item.routingStatus);              
            }else{
                const index = this.routingStatus.indexOf(found);
                this.routingStatus.splice(index, 1) ;
                //this.routingStatus[index] = item;           

               // this.routingStatus.splice(index, 1) ;
            }
         
          this.routingLog = this.utilsService.getPopulatedRoutingLogs(ApplicationService.instance.order_id,item);
          }
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:routingLog`,JSON.stringify(this.routingLog));
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:routingStatus`,JSON.stringify(this.routingStatus));
      }
    });
   }

  /* triggern when click of Tab*/
  tabClickhandler(event,index){

   // this.navigateTab(index);   
   this.navTabs[this.activeTabIndex].isActive = false;
   this.activeTabIndex = index;
   this.navTabs[this.activeTabIndex].isDisabled = false;
   this.navTabs[this.activeTabIndex].isActive = true;
   const viewOrderId = ApplicationService.instance.order_id;

   for (let navLink of this.navTabs) {
    if (navLink.link.indexOf('%orderId%') !== -1) {
      navLink.link = navLink.link.replace('%orderId%', viewOrderId);
    }
    else {
      const slashLastIndex = navLink.link.lastIndexOf('/');
      navLink.link = navLink.link.substring(0, slashLastIndex) + '/' + viewOrderId + navLink.link.substring(navLink.link.length);
    }
  }
  if(this.navTabs[this.activeTabIndex].label != 'Airline/Linehaul'){
    this.agent_name =  this.getAgentname(this.navTabs[this.activeTabIndex].label.toLowerCase());
  }else{
    this.agent_name = '';
  }

  this.router.navigate([this.navTabs[this.activeTabIndex].link]);
  }

  /*search by keyboard Enter btn*/
  searchOrderHandler(event,type){

    switch(type){
      case 'orderId':
          if(this.searchModel.orderId==''){
            this.validationError(this.ipOrderid);
            return;
          }         
          this.searchByOrderId();

      break;
      case 'airBillNo':
          if(this.searchModel.airbillNo==''){
            this.validationError(this.ipAirbilno);
            return;}
            this.searchByAirBill();
      break;

    }
  }

  searchByOrderId(){
    LoaderService.instance.show();

    forkJoin(
      [this.orderSerchService.getOrderData(this.searchModel.orderId), 
      this.orderSerchService.getOrderStatus(this.searchModel.orderId),
      this.rulesService.getRules(this.searchModel.orderId)]
      ).subscribe((response:any)=> {
        LoaderService.instance.close();
        if(response) {
          if(response[0] === null){
            this.dialogService.showInfoPopup(Messages.SEARCH_TITLE, Messages.NO_RECORDS);
          }
          else {

            this.operationModel = response[0]; // order details
            ApplicationService.instance.order_id =  this.operationModel.order_ID;
            this.cacheOrderDetails(response[0]);

            if(response[1]) { // order status details
              this.orderStatusModel = response[1];              
              this.localStorageService.saveData(`${ApplicationService.instance.order_id}:order_status_consolidated`, JSON.stringify(this.orderStatusModel));
             // this.router.navigateByUrl('/', {skipLocationChange: false}).then(() => this.router.navigate([`operations/pickup/${ApplicationService.instance.order_id}`]));              
              this.router.navigate([`operations/pickup/${ApplicationService.instance.order_id}`]);
              this.modelService.modelUpdated(this.operationModel);
              this.getRoutingNotes();
              this.getRoutingStatusOptions();
              this.getCarriersList();
              this.getRoutingDetailStatus();
              this.setActiveIndexOnLoad(`operations/pickup/${ApplicationService.instance.order_id}`);
            }
            if(response[2]) { // business rules
              this.rulesService.initilize(response[2]);
            }
          }
        }
        else {
          console.error("Error while --> searching order")
        }
    },
    (error)=> {
      console.error( error.message);
    });
  }

  private cacheOrderDetails(response) {
    this.clearCacheOfPreviousOrder();
    
    this.localStorageService.saveDataByOrderId('operation_order', JSON.stringify(response));
    /*--------New localstorage Keys for working Show Booking ---------*/
    this.localStorageService.saveDataByOrderId('view_booking_id', response.booking_ID);
    this.localStorageService.saveDataByOrderId('view_order_id', response.order_ID);
    this.localStorageService.saveDataByOrderId('order', JSON.stringify(response));
    this.previousOrderId = response.order_ID;
  }

  private clearCacheOfPreviousOrder() {
    if(this.previousOrderId) {
      this.localStorageService.clear(`${this.previousOrderId}:operation_order`);
      this.localStorageService.clear(`${this.previousOrderId}:view_booking_id`);
      this.localStorageService.clear(`${this.previousOrderId}:view_order_id`);
      this.localStorageService.clear(`${this.previousOrderId}:order`);
      this.localStorageService.clear(`${this.previousOrderId}:order_status_consolidated`);     
      this.localStorageService.clear(`${this.previousOrderId}:navigateUrl`);
      this.localStorageService.clear(`${this.previousOrderId}:OrderRoutingConfig`);      
      this.localStorageService.clear(`${this.previousOrderId}:POP_routingDetailStatus`);
      this.localStorageService.clear(`${this.previousOrderId}:POD_routingDetailStatus`);
      this.localStorageService.clear(`${this.previousOrderId}:routingStatus`);
      this.localStorageService.clear(`${this.previousOrderId}:routingStatusOptions`);
      this.localStorageService.clear(`${this.previousOrderId}:routing_notes`);
    }
  }


  searchByAirBill(){

  }

  /*search by search btn click*/
  searchClickHandler(event){
    if(!this.validateFields()){
      return false;
    }
    if(this.searchModel.orderId !== ''){      
      this.searchByOrderId();
      return;
    }
    if(this.searchModel.airbillNo !== ''){
      this.searchByAirBill();
      return;
    }


  }
  validateFields(){
    let valid:boolean = true;
    if(this.searchModel.orderId == '' &&  this.searchModel.orderId == '' ){
      this.validationError(this.ipOrderid);
      this.validationError(this.ipAirbilno);
      valid = false;
    }
    return valid;
  }
  setActiveIndexOnLoad(url: string) {
    this.navTabs[this.activeTabIndex].isActive = false;
    const arrUrl = ['pickup', 'delivery', 'airline'];
    for (const index in arrUrl) {
      if (url.indexOf(arrUrl[index]) !== -1) {
        this.activeTabIndex = index;
      }
    }
    this.navTabs[this.activeTabIndex].isDisabled = false;
    this.navTabs[this.activeTabIndex].isActive = true;
  }
  validationError(element:any){
    element.nativeElement.style.borderColor='#FF0000';
  }
  saveBtnClickhandler(event){
    // this.operationService.saveOperations(event); 
   // console.log('this.routingData  ',this.routingData);
    const routingNotes:any = this.routingData.filter(item => item.statusCode=='I' || item.statusCode=='U') 
    for(let item of routingNotes){
      item.routing_Note_Consolidated = this.isUpdate_Consolidated_Comments;
      delete  item.id;
      delete item.isEdit;
    }
   // console.log('routingNotes to send  ',routingNotes);
    this.operationService.saveRouting(routingNotes).subscribe((result:any)=>{
      
      if(result.error){
        alert('Error - save order/routing/notes');
        return;
      }
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:carriers`);
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:routing_notes`);
      this.getRoutingNotes(); 

      let routing_status = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routingStatus`);
      this.routingStatus = routing_status ? JSON.parse(routing_status) : new Array();
      const newRoutingStatus = this.routingStatus.filter(element=> element.created_date == null);

      this.operationService.saveRoutingStatus(newRoutingStatus).subscribe((result:any) => {
        if(result.error){
          alert('Error - save order/routing/status');
          return;
        }
        this.localStorageService.clear(`${ApplicationService.instance.order_id}:routingStatus`);        
        this.getRoutingStatus();
        this.routerService.updateRoutingStatus$.next();   
        //this.ngOnInit();    
        let routing_Logs = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:routingLog`);
        if(routing_Logs && JSON.parse(routing_Logs).length>0){
          this.operationService.saveRoutingLogs(JSON.parse(routing_Logs)).subscribe((result:any) => {
            if(result.error){
              alert('Error - order/routing/notification/log');
              return;
            }
            this.localStorageService.clear(`${ApplicationService.instance.order_id}:routingLog`);        
          })
        }
        this.rulesService.getRules(ApplicationService.instance.order_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((rules)=> {
          this.rulesService.initilize(rules);
        });
      })
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
          created_by: AuthService.getInstance().userId,          
          note_type: "Airline",
          order_ID: item.orderId,
          routing_Note_ID: 0,
          routing_ID: item.routingId ,
          statusCode: "I",
          isEdit : false,
          id:`Airline_${item.routingId}` 
        }
        arrCarriers.push(objItem);
      }
      return arrCarriers;
  }

   getRoutingAgent(){
     if(ApplicationService.instance.order_id) {
        this.operationService.getRoutingAgent(ApplicationService.instance.order_id).subscribe((result:any)=>{
          if(result != null){ 
            this.routingAgents = result ;
            this.agent_name =  this.getAgentname(this.navTabs[this.activeTabIndex].label.toLowerCase());
          }     
          console.log('getRoutingAgents  :',this.routingAgents);
        })
     }
  }
  getAgentname(type:any){
    if(this.routingAgents == undefined){
     return  '';
    }
    if(type=='pickup'){
        const agent:any = this.routingAgents.find(item=>item.pickup_Agent_Name != null);
        if(agent){
          return `Agent Name : ${agent.pickup_Agent_Name} , ${agent.pickup_Agent_Phone}`; 
        }
    } else if(type =='delivery'){
         const agent:any = this.routingAgents.find(item=>item.delivery_Agent_Name != null);
         if(agent){
          return `Agent Name : ${agent.delivery_Agent_Name} , ${agent.delivery_Agent_Phone}`; 
         }
    }
    return '';
  }  
  
  private configOrderStatusModel(){
    if(ApplicationService.instance.order_id){
      this.localStorageService.getDataByOrderId('order_status_consolidated').subscribe((response)=>{
        if(response){
          this.orderStatusModel = JSON.parse(response);         
        }
      });
    }
  }

  public commentCBSelecthandler(event){
    console.log('commentsCheckBoxChange  :',event);
    this.isUpdate_Consolidated_Comments = event.isSelected;
  }

}