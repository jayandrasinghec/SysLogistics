import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import {LocalStorageService} from './localstorage.service';
import { API } from '../common/api';

export default class AuthService {
   // public hasToken:boolean = false;
    private static instance: AuthService;
    private _token: string;
    private _userId: any;
    private _userName:any;
    private tokenSubject = new Subject<any>();
    private constructor(private http:HttpClient,private locStorage: LocalStorageService) {
        // do something construct...
    }
    static getInstance(http:HttpClient = null, locStorage: LocalStorageService  = null) {
        if (!AuthService.instance && http) {
            AuthService.instance = new AuthService(http, locStorage);
            // ... any one time initialization goes here ...
        }
        return AuthService.instance;
    }

    async login(data:any){
     /* "loginId": "seaops",
      "password": "seaops"*/
          const response = await this.http.post(`${API.LOGIN_API}`, {
          "loginId": data.username,"password": data.password}).toPromise();
          
          if (response["success"] && response["token"]){
              this.token = response["token"];
              this.userId = response["user"]["userId"];
              //this.hasToken = true;
              this.tokenSubject.next({token:this.token});
              this.locStorage.saveData('userId', response["user"]["userId"]);
              this.locStorage.saveData('userName', response["user"]["loginId"]);
              this.locStorage.saveData('shoTrackToken', response["token"]);
              this.locStorage.saveData('user', JSON.stringify(response["user"]));
          }
          return response;
    }
    onToken(): Observable<any>{
        return this.tokenSubject.asObservable();
    }
    get token() {
        return `Bearer ${this._token}`
    }
    set token(strToken: string){
        this._token = strToken;
    }

    get hasToken(){
        return this.locStorage.getItem('shoTrackToken') ? true : false
    }

    clearUserData(){
        this.locStorage.clear('shoTrackToken');
        this.locStorage.clear('userId');
        this.locStorage.clear('userName');
        this.locStorage.clear('user');
        this.userId = null;
        this.userName = null;
        this.token = null;
    }

    get userId() {
        return this._userId || this.locStorage.getItem('userId');
    }
    set userId(strUserId: string){
        this._userId = strUserId;
    }
    
    get userName() {
        return this._userName || this.locStorage.getItem('userName');
    }
    set userName(strUserName: string){
        this._userName = strUserName;
    }

    get headersWithToken() {
        const token = (this.token !== 'Bearer undefined') ? this.token :  `Bearer ${this.locStorage.getItem('shoTrackToken')}` ;
        
        return {headers : {'Content-Type':'application/json', 'Authorization': token}  }
    }
}
