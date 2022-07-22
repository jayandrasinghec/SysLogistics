import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApplicationService } from 'src/app/services/application.service';

@Injectable()
export class LocalStorageService {

  	public getData(key: string): Observable<string> {
		const token: string = <string>localStorage.getItem(key);
		return of(token);
	}

	public getTabStatusData(key: string): Observable<Boolean[]> {
		const token: string = <string>localStorage.getItem(key);
		return of(JSON.parse(token).data);
	}

	public saveTabStausData(key: string, value: Boolean[]): LocalStorageService {
		localStorage.setItem(key, JSON.stringify({data:value}));
		return this;
	}

	public saveData(key: string, value: string): LocalStorageService {
		localStorage.setItem(key, value);
		return this;
	}
	public saveDataByOrderId(key: string, value: string): LocalStorageService {
		key = `${ApplicationService.instance.order_id}:${key}`
		localStorage.setItem(key, value);
		return this;
	}
	public getDataByOrderId(key: string): Observable<string> {
		key = `${ApplicationService.instance.order_id}:${key}`;
		const token: string = <string>localStorage.getItem(key);
		return of(token);
	}


	public clear(key: string) {
		localStorage.removeItem(key);
  	}
	public clearAll() {
		localStorage.clear()
  	}
	public getItem(key: string) {
	return localStorage.getItem(key);
	}

	public clearBookingData(bookingId:any){
		 let keys=["tabstatus", "tariff_ID","customer_Code", "display_Flag", "customer_Type",
					 "weight_Dimensional_LB","weight_Dimensional_KG", "shoairbill_Number", "pieces",
					 "odf", "customernotification", "notes", "rebateAgents", "CompanyLocations","BookingMethods",
					"BookingAgents", "CreditCardInfo", "IntelLocations", "TimeCodes", "KsmCategories",
          "ShowCodes", "billto", "bookingOrder", "consignee_zone", "shipper_zone", "shipperAirportCodes", "consigneeAirportCodes",
          "editBookingOrder","editSpecialAccount","editCustomernotification","editNotes"  ]
		for(let key of keys){
			localStorage.removeItem(`${bookingId}:${key}`);
		}
		localStorage.removeItem(`${ApplicationService.instance.order_id}:order`);
		// for(let key of keys){
		// 	console.log('clearBookingData', key, localStorage.getItem(`${bookingId}:${key}`))
		// }

  }
  public clearOrderData(orderId: any) {
    const keyArr: Array<any> = ['order', 'view_booking_id', 'view_order_id', 'navigateUrl', 'edit_order_saved','order_status'];
    for (let key of keyArr) {
      localStorage.removeItem(`${orderId}:${key}`);
    }
  }
  /*This methode is getting called when Click on menu buttton and clearing module related keys */
  public clearModuleRelatedKeys(url:any ){
	 	 let keys=['navigateUrlToOperation','operation_order'];
		  for (let key of keys) {
			  if(ApplicationService.instance.order_id){
				localStorage.removeItem(`${ApplicationService.instance.order_id}:${key}`);
			  }      		
   		  }
  }

  public clearAllkeys(){ // This methode wil clear all keys other than _exceptionKeys
	  const _exceptionKeys:any[]  = ['userId','user','shoTrackToken','userName','divisions'] 
	  for (var key in localStorage){
		 	if(!_exceptionKeys.includes(key)){			
				localStorage.removeItem(key);
			}
		}
  }
}
