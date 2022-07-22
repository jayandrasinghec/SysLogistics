import { Injectable } from '@angular/core';
import { Subject , Observable, of} from 'rxjs';
import { API } from '../common/api';
import { HttpService } from './http.service';
@Injectable()
export class UtilitiesService {
    constructor(private httpService: HttpService) {
    }

    public getCompanyLocations(): Observable<any[]> {
        return this.httpService.get(`${API.GET_COMPANY_LOCATIONS_API}`);
    }

    public getDivisions(): Observable<any[]> {
        return this.httpService.get(`${API.GET_DIVISION_DATA_API}`);
    }

    public getKsmsCategories(): Observable<any[]> {
        return this.httpService.get(`${API.GET_KSMS_CATEGORIES_API}`);
    }

    public getShows(): Observable<any[]> {
        return this.httpService.get(`${API.GET_SHOW_CODES_API}`);
    }

    public getTimeCodes(): Observable<any[]> {
        return this.httpService.get(`${API.GET_TIME_CODES_API}`);
    }

    public getField_representatives(): Observable<any[]>{
      return this.httpService.get(`${API.GET_FIELD_REPRESENTATIVES_API}`);
    }

    public getPickupDelieryAgents(AIRPORT_CODE:any,tsaApproved:boolean): Observable<any[]>{
        return this.httpService.get(`${API.GET_PICKUP_DELIVERY_AGENTS_API}${AIRPORT_CODE}&tsa_approved=${tsaApproved}`);
    }

}
