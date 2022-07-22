import { Injectable } from '@angular/core';
import { Subject , Observable, of} from 'rxjs';
import { HttpService } from './http.service';
import { API } from '../common/api';

@Injectable()
export class CustomerNotificationService {
    constructor(private httpService: HttpService) {
    }

    public getCustomerNotificationData(bookingID: any): Observable<any[]> {
        return this.httpService.get(`${API.GET_CUSTOMER_NOTIFICATION_API}${bookingID}`);
    }

    public createCustomerNotification(notifyData: any){
      return this.httpService.post(`${API.CREATE_CUSTOMER_NOTIFICATION_API}`, notifyData);
    }
  
    public updateCustomerNotification(notifyData: any){
        return this.httpService.put(`${API.CREATE_CUSTOMER_NOTIFICATION_API}`,notifyData);
      }

}