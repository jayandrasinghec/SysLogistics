import { Injectable } from '@angular/core';
import { Subject , Observable, of} from 'rxjs';
import AuthService from './auth.service';
import { API } from '../common/api';
import { HttpService } from './http.service';
@Injectable()
export class BillToService {
    httpHeaders:any;
    token:any= "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxMDMiLCJpYXQiOjE1NjY5MTEwNTgsInN1YiI6InNlYW9wcyIsImlzcyI6InNob3RyYWsiLCJmbmFtZSI6InNob2FpciIsImxuYW1lIjoic2Vhb3BzIiwiZW1haWwiOiJtQG0uY29tIiwibGV2ZWwiOiIxIiwib2ZmaWNlY2QiOiIzMCIsImRlcHQiOiJvcGVyYXRpb25zIiwiZmllbGRzcnZyZXAiOiJmYWxzZSIsInNjb3BlIjoiMTksMjAsMjEiLCJleHAiOjE1NjY5MTQ2NTh9.9Y12F8Zrg5iovG1U6GZr0JUC__AnXoxCMbD79VNS-1Q";
    searchUrl: string = 'http://shotrak-apis-alb-195492693.us-west-2.elb.amazonaws.com/shotrak-accounts-api/shotrak/accounts';
     ddBillToOptions: any = [];
    constructor(private httpService: HttpService) {
    }

  public search(term: any): Observable<any> {
    return this.httpService.getSearch(`${API.BILL_TO_NAME_SEARCH_API}${term}`, term);
  }

  public getBookingAgents(customer_code: any): Observable<any[]> {
    return this.httpService.get(`${API.GET_BOOKING_AGENT_API}${customer_code}`);
    //return this.httpService.get(`https://ikv8g98pl5.execute-api.us-west-2.amazonaws.com/${environment.type}/shotrak/accounts/${customer_code}/bookingagents`, AuthService.getInstance().headersWithToken )
  }

  public getCompanyLocations(): Observable<any[]> {
    return this.httpService.get(`${API.GET_COMPANY_LOCATIONS_API}`);
  }

  public getIntelLocations(): Observable<any[]> {
    return this.httpService.get(`${API.GET_INTEL_LOCATIONS_API}`);
  }

  public getBookingMethods(): Observable<any[]> {
    return this.httpService.get(`${API.GET_BOOKING_MEHTODES_API}`);
  }
  
  public getRebateAgents(): Observable<any[]> {
    console.log(AuthService.getInstance().headersWithToken)
    return this.httpService.get(`${API.GET_REBATE_AGENTS_API}`);
    //get(`https://ikv8g98pl5.execute-api.us-west-2.amazonaws.com/${environment.type}/shotrak/accounts/rebateagents`,
  }

  public async getAirportCode(){
    return this.httpService.get(`${API.GET_AIRPORT_CODE_API}`);
  }

  // public createBooking(bookData: any){

  //   return this.http.post(`https://5zbt2n8i3j.execute-api.us-west-2.amazonaws.com/dev/shotrak/customer/order`,bookData,
  //   AuthService.getInstance().headersWithToken )
  //   .pipe(tap(_ => console.log(`Result`)),
  //         catchError(this.handleError('Error in createBooking', {error:true})),
  //         this.responseCheck());
  // }

  public getCreditCardInfo(epay_customer_number: any): Observable<any[]> {
    console.log(AuthService.getInstance().headersWithToken)
    return this.httpService.get(`${API.GET_CREDITCARD_INFO_API}${epay_customer_number}/creditinfo/cards`);
  }

  public saveCreditCardInfo(creditCardData: any): Observable<any[]> {
    return this.httpService.post(`${API.SAVE_CREDITCARD_INFO_API}`,creditCardData);
  }

  public deleteSpecialAccount(bookingID: any):Observable<any[]>{
    return this.httpService.delete(`${API.GET_SPECIAL_ACCOUNT_API}/${bookingID}`);
  }

  public getSpecialAccount(bookingID: any):Observable<any[]>{
    return this.httpService.get(`${API.GET_SPECIAL_ACCOUNT_API}/${bookingID}`);
  }

}
