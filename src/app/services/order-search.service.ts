import { Injectable } from '@angular/core';
import { Subject , Observable} from 'rxjs';
import { API } from '../common/api';
import { HttpService } from './http.service';

@Injectable()
export class OrderSearchService {
    httpHeaders: any;
    public searchresult = new Subject<any>();

    constructor(private httpService: HttpService) {
    }

    public getOrderData(orderID: any): Observable<any[]> {
      return this.httpService.get(`${API.GET_ORDER_DATA_API}${orderID}`);
    }

    public getOrderStatus(orderID: any): Observable<any[]> {
      return this.httpService.get(`${API.GET_ORDER_STATUS_API}${orderID}`);
    }

    onSearchResult(): Observable<any> {
      return this.searchresult.asObservable();
    }

}
