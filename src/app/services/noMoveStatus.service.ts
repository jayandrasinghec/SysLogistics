import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { HttpService } from './http.service';
import { API } from '../common/api';

@Injectable({
  providedIn: 'root'
})
export class NoMoveStatusService {
  httpHeaders: any;

  constructor(private httpService: HttpService) { }

  public getStatusCodes(): Observable<any[]> {
    return this.httpService.get(`${API.GET_STATUS_CODES_API}`);
  }

  public createNoMoves(orderId: any, noMovesData: any) {
    return this.httpService.post(`${API.GET_NO_MOVES_API}${orderId}/nomovenotes`,noMovesData);
  }

  public getNoMoves(orderId: any) {
    return this.httpService.get(`${API.GET_NO_MOVES_API}${orderId}/nomovenotes`);
  }

}
