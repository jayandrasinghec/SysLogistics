import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject , Observable, of} from 'rxjs';
import { map, tap, catchError } from "rxjs/operators";
import AuthService from './auth.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class MenuButtonService {
    httpHeaders:any;
    private static _instance: MenuButtonService = null;
    private static _singletonEnforcer: boolean;
    constructor( ) {
       if (!MenuButtonService._singletonEnforcer) {
        throw new Error('This is a singleton class. Use MenuButtonService.instance to get the instance!!');
       }
    }
    public static get instance(): MenuButtonService {
      if (this._instance == null) {
          this._singletonEnforcer = true;
          this._instance = new MenuButtonService();
          this._singletonEnforcer = false;
      }
      return this._instance;
   }
    /*------- Updating Menu Button---------------*/
    private menuButtonEvent = new BehaviorSubject({});
    menuButtonEvent$ = this.menuButtonEvent.asObservable();
    updateMenuScreen(event: any) {    
      console.log('menuButtonEvent event ',event);    
        this.menuButtonEvent.next(event);
    }

     



}

