import { Injectable } from '@angular/core';
import { Subject , Observable} from 'rxjs';
import { API } from '../common/api';
import { HttpService } from './http.service';
@Injectable()
export class OrigindestinationFreightService {
    httpHeaders:any;
    constructor(private httpService: HttpService) {
    }

    public search(term: any): Observable<any> {
        return this.httpService.get(`${API.BILL_TO_NAME_SEARCH_API}${term}`);
    }

    public getShipperAirportCode (zipCode: any): Observable<any[]> {
      return this.httpService.get(`${API.GET_SHIPPER_AIRPORT_CODE_API}${zipCode}`);
    }

    public getKsmsCategories (): Observable<any[]> {
      return this.httpService.get(`${API.GET_KSMS_CATEGORIES_API}`);
    }

    public getShowCodes (): Observable<any[]> {
      return this.httpService.get(`${API.GET_SHOW_CODES_API}`);
    }

    public getTimeCodes (): Observable<any[]> {
      return this.httpService.get(`${API.GET_TIME_CODES_API}`);
    }

    public getServiceLevels (tariffID: any): Observable<any[]> {
      return this.httpService.get(`${API.GET_SERVICE_LEVELS_API}${tariffID}`);
    }

    public createDimension(freightDimensions){     
      return this.httpService.post(`${API.CREATE_DIAMENSION_API}`,freightDimensions);
    }
    
    public getCalculateDimensions(bookingID: any): Observable<any> {
      return this.httpService.get(`${API.GET_DIAMENSIONS_API}${bookingID}`);
    }

    public getSpecialCharges(bookingID, selectedTypeId, zone, sourceKey): Observable<any[]>{
      return this.httpService.get(`${API.GET_SPECIAL_CHARGES_API}/${bookingID}/${selectedTypeId}?zone=${zone}&sourceKey=${sourceKey}`);
    }

    public createSpecialCharges(specialcharges: any[]){      
      return this.httpService.post(`${API.GET_SPECIAL_CHARGES_API}`,specialcharges);
    }

    public updateWeightDiamension(data : any):Observable<any[]>{
      return this.httpService.put(`${API.UPDATE_WEIGHT_DIAMENSION_API}`, data);
    }

}

