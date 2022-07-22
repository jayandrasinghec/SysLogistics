import { Injectable } from '@angular/core';
import { Subject , Observable, of} from 'rxjs';
import { map, tap, catchError } from "rxjs/operators";
import { BehaviorSubject, forkJoin } from 'rxjs';
import { API } from '../common/api';
import { HttpService } from './http.service';
 
@Injectable()
export class OperationsService {
    httpHeaders:any;
    constructor(private httpService: HttpService) {
    }

    /*------- Updating Routing Data from tabs---------------*/
    private updateRoutingData = new Subject();
    updateRoutingData$ = this.updateRoutingData.asObservable();
    updateRoutingDatas(event: any) {        
        this.updateRoutingData.next(event);
    }

    /*-------When the GET ROUTING NOTES then  Updating the tabs---------------*/
    private commentsData = new BehaviorSubject({});
    commentsData$ = this.commentsData.asObservable();
    updateCommentsDatas(event: any) {        
        this.commentsData.next(event);
    }

    /*------- Updating Routing Data from tabs page to tab component---------------*/
    private updateRoutingStatus = new Subject();
    updateRoutingStatus$ = this.updateRoutingStatus.asObservable();
    updateRoutingStatuses(event: any) {        
      this.updateRoutingStatus.next(event);
    }

    /*------- Emitting Routing Status from tab.component to 3 pages---------------*/
    private RoutingStatus = new BehaviorSubject({});
    RoutingStatus$ = this.RoutingStatus.asObservable();
    emitRoutingStatus(event: any) {        
      this.RoutingStatus.next(event);
    }

   /*------- Emitting Carriers from tab.component to 3 tab pages---------------*/
    private carrierList = new BehaviorSubject({});
    carrierList$ = this.carrierList.asObservable();
    emitCarrierList(event: any) {        
      this.carrierList.next(event);
    }

    private routingDetailStatus = new BehaviorSubject({});
    RoutingDetailStatus$ = this.routingDetailStatus.asObservable();
    emitRoutingDetailStatus(event : any)
    {
      this.routingDetailStatus.next(event);
    }

    public getCarriers (orderId: any): Observable<any[]> {
      return this.httpService.get(`${API.GET_CARRIERS_API}${orderId}/carriers`);
    }

    public getCarrierCodes (): Observable<any[]> {
      return this.httpService.get(`${API.GET_CARRIER_CODES_API}`);
    }

    public getCarrierServiceLevels(tariff_ID : any): Observable<any[]> {
      return this.httpService.get(`${API.GET_CARRIER_SERVICE_LEVELS_API}${tariff_ID}`);
    }

    public saveCarriersData(carriersData:any): Observable<any[]> {
      return this.httpService.post(`${API.SAVE_CARRIERS_DATA_API}`, carriersData);
    }

    public getField_representatives(): Observable<any[]> {
      return this.httpService.get(`${API.GET_FIELD_REPRESENTATIVES_API}`);
    }

    public getFieldServiceAgents(orderId: any): Observable<any[]> {
      return this.httpService.get(`${API.GET_FIELD_SERVICE_AGENTS_API}${orderId}`);
    }

    public savefieldServiceAgents(request: any, userId: any): Observable<any[]> {
      return this.httpService.post(`${API.SAVE_FIELD_SERVICE_AGENTS_API}`, request);
    }


    /*----------UPLOAD FILE-------------*/
 
   public uploadFile(fileDetails: any ): Observable<any[]> {
      return this.httpService.post(`${API.UPLOAD_FILE_API}`, fileDetails);
    }  

    /*------------FILE MANAGER API---------------- */
     public getFiles(orderId: any): Observable<any[]> {
      return this.httpService.get(`${API.GET_FILES_API}/${orderId}`);
    }


    public deleteFileDetails(file_ID:any): Observable<any[]>{
       return this.httpService.get(`${API.DELETE_FILE_DETAILS_API}${file_ID}`);
    }

     public updateFileDescription(fileDetails: any ): Observable<any[]> {
      return this.httpService.post(`${API.UPLOAD_FILE_DESCRIPTION_API}`, fileDetails);
    } 

     public getUploadedFile(file_ID:any): Observable<any[]>{
       return this.httpService.get(`${API.GET_UPLOADED_FILE_API}${file_ID}`);
    }
   
    public saveFileDetails(fileDetails: any ): Observable<any[]> {
        return this.httpService.post(`${API.GET_FILES_API}`, fileDetails);
    } 
   /*------------PICKUP/DELIVERY  ---------------- */

   public  getOriginDestinationCarrierList(order_ID:any):Observable<any[]> {
      return this.httpService.get(`${API.GET_ORIGIN_DESTINATION_CARRIERLIST_API}${order_ID}`);
   }
   
   public  getOrderRoutingConfig(order_ID:any):Observable<any[]> {
    return this.httpService.get(`${API.GET_ORDER_ROUTING_CONFIG_API}${order_ID}`);
 }

 public getRoutingNotificationLogs(order_ID:any) {
     return this.httpService.get(`${API.GET_ROUTING_NOTIFICATION_LOGS_API}${order_ID}`);
 }
     
  public saveRoutingLogs(routingLogs:any):Observable<any[]> {
     return this.httpService.post(`${API.SAVE_ROUTING_LOGS_API}`, routingLogs);
  }

  public deleteRoutingLogs(emaillogid:any):Observable<any[]> {
    return this.httpService.delete(`${API.DELETE_ROUTING_LOGS_API}${emaillogid}`);
 }  
    
  public  geRouting(order_ID:any):Observable<any[]> {
     return this.httpService.get(`${API.GET_ROUTING_NOTES_API}${order_ID}`);
  }

  public  getNotificationMapping():Observable<any[]> {
     return this.httpService.get(`${API.GET_NOTIFICATION_MAPPING_API}`);
  }

  public  getRoutingStatusOptions():Observable<any[]> {
     return this.httpService.get(`${API.GET_ROUTING_STATUS_OPTIONS_API}`);
  }

 public  saveRouting(data:any):Observable<any[]> { 
     return this.httpService.post(`${API.SAVE_ROUTING_NOTES_API}`,data);
  }

  public updateActualWeightAndPieces(data:any):Observable<any[]> { 
    return this.httpService.put(`${API.UPDATE_WEIGHT_PIECES_API}`,data);
  }
  
  public saveRoutingStatus(data:any):Observable<any[]> {         
      return this.httpService.post(`${API.ORDER_STATUS_API}`,data);
  }
    
  public  getRoutingStatus(order_Id:any):Observable<any[]> {
    return this.httpService.get(`${API.ORDER_STATUS_API}?orderid=${order_Id}`);
 }


 /*---------------LABEL-------------------*/
  public  saveLabel(data:any):Observable<any[]> {         
    return this.httpService.post(`${API.SAVE_LABEL_API}`,data);
  }
public  getLabel(order_Id:any):Observable<any[]> {
    return this.httpService.get(`${API.GET_LABEL_API}${order_Id}`);
 }
 
 public getRoutingDetail(orderId : any):Observable<any[]>{
    return this.httpService.get(`${API.GET_ROUTING_DETAIL_API}${orderId}`);
 }
 
 public getRoutingAttachment(orderId : any):Observable<any[]>{
   return this.httpService.get(`${API.GET_ROUTING_ATTACHMENT_API}${orderId}`);
 }

 public saveRoutingDetail(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_ROUTING_DETAIL_API}`, data);
 }
 
 public saveRoutingAttachment(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_ROUTING_ATTACHMENT_API}`, data);
 }

public updateLabel(data:any):Observable<any[]> {
   return this.httpService.put(`${API.SAVE_LABEL_API}`,data);
 }

public savePickupDeliveryAlert(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_PICKUP_DELIVERY_ALERT_API}`, data);
 }

public updatePickupDeliveryAlert(data : any):Observable<any[]>{
  return this.httpService.put(`${API.SAVE_PICKUP_DELIVERY_ALERT_API}`, data);
 }

public getPickupDeliveryAlert(orderId:any,type:any):Observable<any[]>{
  return this.httpService.get(`${API.GET_PICKUP_DELIVERY_ALERT_API}${orderId}&alerttype=${type}`);
 }

public getTruckAlert(orderId:any):Observable<any[]>{
  return this.httpService.get(`${API.GET_TRUCK_ALERT_API}${orderId}`);
 }

public saveTruckAlert(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_TRUCK_ALERT_API}`, data);
 }

public updateTruckAlert(data : any):Observable<any[]>{
  return this.httpService.put(`${API.SAVE_TRUCK_ALERT_API}`, data);
 }

 /*-----------------------------------*/
public saveRoutingAgent(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_ROUTING_AGENT_API}`, data);
 }
 
public updateRoutingAgent(data : any):Observable<any[]>{
  return this.httpService.put(`${API.SAVE_ROUTING_AGENT_API}`, data);
 }

public getRoutingAgent(order_id:any):Observable<any[]>{
  return this.httpService.get(`${API.GET_ROUTING_AGENT_API}${order_id}`);
 }

 public getAlertTypes():Observable<any[]>{
  return this.httpService.get(`${API.GET_ALERT_TYPES_API}`);
 }

 public removeRoutingDetail(order_ID:any, type:any, oderDetailId:any): Observable<any[]>{
  return this.httpService.delete(`${API.GET_ROUTING_DETAIL_API}${order_ID}&type=${type}&routingdetailid=${oderDetailId}`);
}

 /*------------------------------------*/
 /*------------------------------------*/


 public getRoutingAlert(orderId:any):Observable<any[]>{ 
  return this.httpService.get(`${API.GET_ROUTING_ALERT_API}${orderId}`);
 }

public saveRoutingAlert(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_ROUTING_ALERT_API}`, data);
 }

public updateRoutingAlert(data : any):Observable<any[]>{
  return this.httpService.put(`${API.SAVE_ROUTING_ALERT_API}`, data);
 }

 /*------------------ROUTING ALERT APIs-------------------------------------------------*/

public getAirBills(orderId:any):Observable<any[]>{ 
  return this.httpService.get(`${API.GET_ROUTING_ALERT_API}${orderId}`);
 }

public getServiceLevel_JOEY(orderId:any):Observable<any[]>{ 
  return this.httpService.get(`${API.GET_ROUTING_ALERT_API}${orderId}`);
 }

public getServiceLevel_FAX(orderId:any):Observable<any[]>{ 
  return this.httpService.get(`${API.GET_ROUTING_ALERT_API}${orderId}`);
 }

public getServiceFailure(orderId:any):Observable<any[]>{ 
  return this.httpService.get(`${API.GET_SERVICE_FAILURE_API}${orderId}`);
 }

 public getServiceFailureAttachment(orderId:any):Observable<any[]>{ 
  return this.httpService.get(`${API.GET_SERVICE_FAILURE_ATTACHMENT_API}${orderId}`);
 }
 
public saveServiceFailure(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_SERVICE_FAILURE_API}`, data);
 }

 public saveServiceFailureAttachment(data : any):Observable<any[]>{
  return this.httpService.post(`${API.SAVE_SERVICE_FAILURE_ATTACHMENT_API}`, data);
 }
 
public extendedSearch(data : any):Observable<any[]>{
  return this.httpService.post(`${API.EXTENDED_SEARCH_API}`, data);
 }

public getCareersAndRoutingNotes(orderId:any):Observable<any[]>{ 
  const careersURL = this.httpService.get(`${API.GET_CARRIERS_API}${orderId}/carriers`);
  const routingnotesUrl = this.httpService.get(`${API.GET_ROUTING_NOTES_API}${orderId}`);
  return forkJoin([careersURL,routingnotesUrl]).pipe(
      tap(_ => console.log(`found getCareersAndRoutingNotes`)),
      catchError(this.handleError("getCareersAndRoutingNotes", [])),
      map((r: any) => {
              if(r.error){
                return r;
              }
              return {careers:r[0] ,notes:r[1] };
          })
    );
 }

 private handleError<T> (operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    // TODO: better job of transforming error for user consumption
    console.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}
 
}

