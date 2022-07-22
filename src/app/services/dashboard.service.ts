import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import AuthService from 'src/app/services/auth.service';
import { API } from '../common/api';
import { HttpService } from './http.service';

@Injectable()
export class DashboardService{

    constructor(private httpService: HttpService) {
        
    }

    public getDivisionData(): Observable<any[]> {
        return this.httpService.get(`${API.GET_DIVISION_DATA_API}`);
    }

}