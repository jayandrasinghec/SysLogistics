import { Injectable } from '@angular/core';
import {LocalStorageService} from './localstorage.service';
import { OrderRoutingLog } from 'src/app/core/models/order-routing-log.model';
import AuthService from './auth.service';
import { Messages } from '../common/Messages';
@Injectable({providedIn:"root"})
export class UtilsService{

    constructor(private lsService:LocalStorageService) {
    }

   public getCurrentDate(){
    const date = new Date();
    const mnth = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
   }
   

   public getCurrentDate_MMDDYYYY(separator : any){
    const date = new Date();
    const mnth = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear()].join(separator);
   }

   public getDisplayDateTime(date:any){
   const datetime: any[] = (date && date.indexOf('T') !== -1) ? date.split('T') : [];
   let formattedDateTime = '';
   if(datetime.length > 1){
        const spittedDate: any[] = datetime[0].split('-');
        if(spittedDate.length > 2)
        {
            formattedDateTime = `${spittedDate[1]}-${spittedDate[2]}-${spittedDate[0]}`;
        }
        const splittedTime = datetime[1].split(':');
        if(splittedTime.length > 1)
        {
            const hours = splittedTime[0] > 12 ? splittedTime[0] - 12 : splittedTime[0];
            const am_pm = splittedTime[0] >= 12 ? "PM" : "AM";

            formattedDateTime = `${formattedDateTime} ${hours}:${splittedTime[1]} ${am_pm}`;
        }

   }

   return formattedDateTime;
   }

    public getDisplayDate(date: any) {
        const datetime: any[] = (date && date.indexOf('T') !== -1) ? date.split('T') : [];
        let formattedDate = '';
        if (datetime.length > 1) {
            const spittedDate: any[] = datetime[0].split('-');
            if(spittedDate.length > 2)
            {
                formattedDate = `${spittedDate[1]}-${spittedDate[2]}-${spittedDate[0]}`;
            }
        }
        return formattedDate;
    }

    public getDisplayDate_MMDDYYYY(date: any, separator: any) {
        const datetime: any[] = (date && date.indexOf('T') !== -1) ? date.split('T') : [];
        let formattedDate = '';
        if (datetime.length > 1) {
            const spittedDate: any[] = datetime[0].split('-');
            if(spittedDate.length > 2)
            {
                formattedDate = `${spittedDate[1]}${separator}${spittedDate[2]}${separator}${spittedDate[0]}`;
            }
        }
        return formattedDate;
    }

    public getDisplayTime(date: any){
        const datetime: any[] = (date && date.indexOf('T') !== -1) ? date.split('T') : [];
        let formattedTime = '';
        if (datetime.length > 1) {
            const splittedTime = datetime[1].split(':');
            if(splittedTime.length > 1)
            {
                const hours = splittedTime[0] > 12 ? splittedTime[0] - 12 : splittedTime[0];
                const am_pm = splittedTime[0] >= 12 ? 'PM' : 'AM';

                formattedTime = `${hours}:${splittedTime[1]} ${am_pm}`;
            }
        }
        return formattedTime;
    }

    public getDisplayTime_hhmmss(date: any){
        const datetime: any[] = (date && date.indexOf('T') !== -1) ? date.split('T') : [];
        let formattedTime = '';
        if (datetime.length > 1) {
            const splittedTime = datetime[1].split(':');
            if(splittedTime.length > 1)
            {
                const hours = splittedTime[0] > 12 ? splittedTime[0] - 12 : splittedTime[0];
                const am_pm = splittedTime[0] >= 12 ? 'PM' : 'AM';

                const secondsArr = splittedTime[2].split('.');
                const seconds = secondsArr.length > 0 ? secondsArr[0] :''
                formattedTime = `${hours}:${splittedTime[1]}:${seconds} ${am_pm}`;
            }
        }
        return formattedTime;
    }
    /*Checking all madatory fields are valid  */
    public isOrderDataValid(model: any) {
        const arrValidKeys: Array<string> = [
        'shipper_Name','consignee_Name','origin_Air_Code','dest_Air_Code','origin_Zone','dest_Zone',
        'shipper_Address1','consignee_Address1','origin_KSMS_Number','dest_KSMS_Number','shipper_City',
        'consignee_City','shipper_State','consignee_State','shipper_Zip','consignee_Zip','load_Date','delivery_Date','load_Time_From',
        'delivery_Time_From','load_Time_To','delivery_Time_To','pieces','weight_Actual_LB','customer_Code',
        'service_Level_Code','declared_Value',
        'billTo_Name', 'po_Number', 'pieces_Description' ];
        const creditCardTypes = [ "CREDCARD","CREDTCRD","VISA","AMEX", "VISA-1", "AMEX-1","MC"]
        for (let item of arrValidKeys) {
          const value = model[item];
          if (value === null || value === undefined || value === '') {
            return false   ;
          }
        }
         // Check for interger field where empty field default value is 0.
         const numericFields: Array<string> = ['pieces','weight_Actual_LB']
         for (let item of numericFields) {
             const value = model[item];
             if (value === 0) {
               return false   ;
             }
         }
         
         // iF credit card
        if (model.payment_Type &&  creditCardTypes.includes(model.payment_Type)  ) {
          if ( model.card_Number === null ||  model.card_Number === undefined ||  model.card_Number === '') {
            return false   ;
          }
          if ( model.card_Approval_No === null ||  model.card_Approval_No === undefined ||  model.card_Approval_No === '') {
            return false   ;
          }
        }
        return true ;

    }
    public isValidSpecialAccountData(model:any) {
        const arrValidKeys: Array<string> = ['locationCode', 'ccref'];
        for (let item of arrValidKeys) {
          const value = model[item];
          if (value === null || value === undefined || value === '') {
            return false   ;
          }
        }
        return true;
    }
   

    public isObjectPresent(itemObj:any,array:any){
        for(let item of array){
            if(this.compareObject(item,itemObj) ){
                return true;
            }
        }
        return false;
    }

public compareObject(sourceObj:any,targetObj:any){
        for(var p in sourceObj){
        if(sourceObj.hasOwnProperty(p)){
            if(sourceObj[p] !== targetObj[p]){
                return false;
            }
        }
    }
    for(var p in targetObj){
        if(targetObj.hasOwnProperty(p)){
            if(sourceObj[p] !== targetObj[p]){
                return false;
            }
        }
    }
    return true;  
}

 public isIOS(){
    const _iOSDevice = !!navigator.platform.match(/iPhone|iPad/);
    return _iOSDevice;
 }

 public getContentType(extension:string){
    let contentType:string;
    switch(extension){
        case 'pdf':
        contentType = 'application/pdf';
        break;
        case 'png':
        contentType = 'image/png';
        break;
        

    }
    return contentType;
 }
 public isOperationSaved() : boolean{
    let routingnotes:any = this.lsService.getDataByOrderId('routing_notes');
    let routingStatus: any = this.lsService.getDataByOrderId('routingStatus');
    routingnotes = (routingnotes && routingnotes.value )?JSON.parse(routingnotes.value):[];
    routingStatus = (routingStatus && routingStatus.value)?JSON.parse(routingStatus.value):[];
    const newNote  = routingnotes.find(element=> element.created_date == null);
    const newStatus  = routingStatus.find(element=> element.created_date == null);

    if(newNote || newStatus){
        return false;
    }
    return true;
 }

 public formatTimeInput(time:any){
    let formattedTime:string;
    let _time:string = (time != undefined && time != null) ? time.toString():'';
    if(_time && _time.length > 0 && _time.length < 4 ){
        switch(_time.length){
            case 1:
            formattedTime = '000'+_time;
            break;
            case 2:
            formattedTime = '00'+_time;
            break;
            case 3:
            formattedTime = '0'+_time;
            break;
        }
        return formattedTime;
      }
      return time;
 }

  public getCloneofArray(originArr:any){
    let i = -1;
    let copyArray:any[]=[];
    while (++ i < originArr.length){
      copyArray[i] = Object.assign({},originArr[i])  ;
    }
    return copyArray;
  }

  getPopulatedRoutingLogs(orderID:any,RoutingCBData:any){
    let populatedRoutingLogs:any[] =[];
    let routingLogsLS = this.lsService.getItem(`${orderID}:routingLog`);
    populatedRoutingLogs = routingLogsLS ? JSON.parse(routingLogsLS) : new Array();    

    const routingLogsExist = populatedRoutingLogs.filter(element => {
      element.routing_Code == RoutingCBData.routingStatus.routing_Code
    });

    if(routingLogsExist && routingLogsExist.length>0){
      for(let log of routingLogsExist){
        const routingLog_Index = populatedRoutingLogs.findIndex(element => element.routing_Code == log.routing_Code);
        populatedRoutingLogs.splice(routingLog_Index, 1) ; 
      }              
    }
    else{
      let routing_log = this.generateOrderRoutingLog(RoutingCBData,orderID)
      if(routing_log && routing_log.length > 0){                
        populatedRoutingLogs =  populatedRoutingLogs.concat(routing_log);
      }
    }
    return populatedRoutingLogs;
  }
  
  generateOrderRoutingLog(RoutingCBData:any,orderID:any){
    let orderRoutingLogs = [];
    let routing_code:any = RoutingCBData.routingStatus.routing_Code || RoutingCBData.routingStatus.routing_code;
    let category:any = RoutingCBData.category;
    let sendPic:boolean = (RoutingCBData.routingStatus.sendPic != undefined) ? RoutingCBData.routingStatus.sendPic : false;
    this.lsService.getData(`${orderID}:OrderRoutingConfig`).subscribe((result) => {
      if(result)
      {
        let orderRoutingConfigs = JSON.parse(result);
        if(orderRoutingConfigs.length > 0)
          {
             //case 1  If cn.Notify_Customer_Flag = 1, Setup this option when nm.Routing_Code = Routing Code
             let case1Config = orderRoutingConfigs.find(config => config.routing_Code == routing_code && config.notify_Customer_Flag ==true);
            if(case1Config != undefined){
              orderRoutingLogs.push(this.getOrderRoutingLog(case1Config, routing_code, category,'CLN',orderID,sendPic)); 
            }
            //case 2  IF cn.Pickup_Reminder_Flag = 1 , Setup this option for Only Pickup Routing Codes.
            let case2Config:any = orderRoutingConfigs.find(config => config.pickup_Reminder_Flag == true);
            if(case2Config != undefined && category == "P/U"){
                orderRoutingLogs.push(this.getOrderRoutingLog(case2Config, routing_code, category,'PUR',orderID,sendPic)); 
            }
            // case 3  If cn.Notify_Booking_Agent_Flag = 1, Setup this option for all Routing Codes for Pickup, Delivery, and Airline/Linehaul
            let case3Config:any = orderRoutingConfigs.find(config => config.notify_Booking_Agent_Flag == true);
            if(case3Config){
              orderRoutingLogs.push(this.getOrderRoutingLog(case3Config, routing_code, category,'BAG',orderID,sendPic)); 
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
  getOrderRoutingLog(orderRoutingConfig:any, routing_code:any, category : any,recType:any,orderID:any,sendPic:boolean){
    let orderRoutingLog = new OrderRoutingLog();    
    orderRoutingLog.created_By = AuthService.getInstance().userId;
    orderRoutingLog.deleted_By = null;
    orderRoutingLog.email_Log_ID = null;
    orderRoutingLog.notification_Config_ID =  orderRoutingConfig.notification_Config_ID ;
    orderRoutingLog.order_ID = orderID;
    orderRoutingLog.routing_Code = routing_code;
    orderRoutingLog.sent_By = null;
    orderRoutingLog.sent_Date = null;
    orderRoutingLog.status_Date = null;
    orderRoutingLog.status_Message = null;
    orderRoutingLog.recipient_Type = recType;
    orderRoutingLog.email_Address = this.getEmailAddressFromConfig(orderRoutingConfig,recType);
    orderRoutingLog.attention = (recType =='CLN')?orderRoutingConfig.client_Attention:null;
    orderRoutingLog.sendPic = sendPic;
    return orderRoutingLog;
  }
getEmailAddressFromConfig(config:any,recType:any){
    let _email:any='';
    if(config){
        switch(recType){
          case 'CLN':
          _email  = config.client_Email;
          break;
          case 'PUR':
          _email  = config.pickup_Reminder_Email;
          break;
          case 'BAG':
          _email  = config.booking_Agent_Email;
          break;
        }
    }
    return _email;
}

getModuleNameFromTabID(tabID:any):string {
    let moduleName:any;
    switch(tabID){
      case 'PU':
      moduleName= 'Pickup';
      break;
      case 'DEL':
      moduleName= 'Delivery';
      break;
      case 'AL':
      moduleName= 'Airline';
      break;
     }
     return moduleName;
}

}

