import { Component, OnInit } from '@angular/core';
import AuthService from '../../../../../../services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import  {OperationsService} from 'src/app/services/operation.service';
import { MatDialog } from '@angular/material';
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  public  alertType :any;
  public  alertCategory :any;

  public arrAlertOptions:any[];  
  public arrAlertTypes:any[] =[]; //Pickup, Delivery,Routing,Truck Alert
  public arrCarriersList:any[];
  public orderID:any;
  public orderObj:any;
  public routingAgent:any;
  public showNavBtns:boolean = false;
  public navIndex:any = 0;
  public routingAlerts:any[]=[];
  public navAction:any =null;
  constructor(private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService, 
               private router: Router,
               private operationService: OperationsService,
                public dialog: MatDialog ) { }

  ngOnInit() {
    this.alertType ='RA';
    this.alertCategory ='RA';     
    this.getOrderFromLS();
    this.getAlertOptions();
    this.getRoutingAgent(); 
    this.getCarriersList();
  }
  getOrderFromLS(){
        
      this.orderID = this.activatedRoute.snapshot.paramMap.get('orderid') ; 
      const order :any = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`);
      this.orderObj = JSON.parse(order);
  
}
 getAlertOptions(){
    this.operationService.getAlertTypes().subscribe((response:any)=>{
      console.log('getAlertOptions',response);
      this.arrAlertOptions = response.filter(item=> item.category == 'Alert Option') ;
      const alertTypes =  response.filter(item=> item.category == 'Alert Type' || item.alert_Type == null);
      
      for(let item of alertTypes){
      //  item.alert_Option =  item.alert_Option.replace(/\n/ig, '');
        this.arrAlertTypes[item.display_Order -1] = item; 
      }
      console.log(' this.arrAlertTypes1  ', this.arrAlertTypes  );
      console.log(' this.arrAlertOptions  ', this.arrAlertOptions);
      // console.log(' this.arrAlertTypes2  ', this.arrAlertTypes.sort(item=> item.display_Order)  );
    });
  
  }
   getRoutingAgent(){
    console.log('getRoutingAgent');
    this.operationService.getRoutingAgent(this.orderID ).subscribe((result:any)=>{
      if(result != null){ 
         this.routingAgent = result ;
      }     
      console.log('routingAgent  ',this.routingAgent);
    })
  }
  getCarriersList(){
    
        this.operationService.getCarriers(this.orderID).subscribe((response:any)=>{
          if(response.error){
            alert('Error - get orders/${orderId}/carriers');
            return false;
          }
          this.arrCarriersList = response.carriers.filter(element => element.carrierCode !== null);
          console.log('this.arrCarriersList  ',this.arrCarriersList);
         });
    
  } 
  optionChange(option){
    console.log(' option  ',option);
    console.log('alertCategory ',this.alertCategory+':::');
  }
  showRoutingAlertNav(event){
    if(event){
      this.showNavBtns = true;
      this.routingAlerts = event.alerts;
      this.navIndex = event.index;
    }
   
  }
  navBtnClickHandler(type){
   if(type=='next'){
      this.navIndex = this.navIndex +1;
    }
    else{
    this.navIndex = this.navIndex - 1;
    }
  }
}
