import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpService } from './http.service';
import { API } from '../common/api';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  public updateRoutingStatus$ = new Subject();
  
  constructor(private httpService: HttpService) { }

  public getRoutingStatus(order_Id:any):Observable<any> {
    return this.httpService.get(`${API.ORDER_STATUS_API}?orderid=${order_Id}`);
  }
}
