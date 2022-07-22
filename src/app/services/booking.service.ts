import { Injectable } from '@angular/core';
import { Subject , Observable} from 'rxjs';
import AuthService from './auth.service';
import { HttpService } from './http.service';
import { API } from '../common/api';
@Injectable()
export class BookingService {
    constructor(private httpService: HttpService) {
    }

  public getBookingById(bookingId: any){
    return this.httpService.get(`${API.GET_BOOKING_DATA_API}${bookingId}`);
  }

  public createBooking(bookData: any){
    const authService = AuthService.getInstance();
    bookData.created_By = authService.userId;
    return this.httpService.post(`${API.CREATE_BOOKING_API}`,bookData);
  }

  public updateBooking(bookData: any){
    return this.httpService.put(`${API.SAVE_BOOKING_API}false`,bookData);
  }

  public saveBooking(submitOrder : any, bookData: any){
    return this.httpService.put(`${API.SAVE_BOOKING_API}${submitOrder}`,bookData);
  }

  public createSpecialAccount(specialAccountData: any){
    const authService = AuthService.getInstance();
    specialAccountData.created_by = authService.userId;
    return this.httpService.post(`${API.GET_SPECIAL_ACCOUNT_API}`,specialAccountData);
  }

  public updateSpecialAccount(bookingId: any, bookData: any){
    return this.httpService.put(`${API.GET_SPECIAL_ACCOUNT_API}/${bookingId}`,bookData);
  }

  public getSpecialAccountData (bookingID: any): Observable<any[]> {
    return this.httpService.get(`${API.GET_SPECIAL_ACCOUNT_API}/${bookingID}`);
  }

  public getBookingData (bookingID: any): Observable<any[]> {
    return this.httpService.get(`${API.GET_BOOKING_DATA_API}${bookingID}`);
  }

  public getOrderData (orderID: any): Observable<any[]> {
    return this.httpService.get(`${API.GET_ORDER_DATA_API}${orderID}`);
  }

  public getOrderHistoryData(orderID: any): Observable<any[]> {
    return this.httpService.get(`${API.GET_ORDER_HISTORY_DATA_API}${orderID}`);
  }

  public getNTSData(orderID: any) {
    return this.httpService.get(`${API.GET_NTS_DATA_API}/${orderID}`);
  }

  public saveNTSData(ntsData: any) {
    return this.httpService.post(`${API.GET_NTS_DATA_API}`,ntsData);
  }

  public saveConsolidatedOrders(consOrders: any) {
    return this.httpService.post(`${API.SAVE_CONSOLIDATE_ORDER_API}`, consOrders);
  }

  public getConsolidatedOrders(order_ID: any) {
    return this.httpService.get(`${API.GET_CONSOLIDATE_ORDER_API}${order_ID}`);
  }

}
