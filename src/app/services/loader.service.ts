import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material';
import {SpinningLoaderComponent} from '../content/partials/components/spinning-loader/spinning-loader.component';
@Injectable()
export class LoaderService {


  private static _instance: LoaderService = null;
  private static _singletonEnforcer: boolean;

  eventChanged$: BehaviorSubject<any>;

  constructor() {
      if (!LoaderService._singletonEnforcer) {
        throw new Error('This is a singleton class. Use LoaderService.instance to get the instance!!');
       }
      this.eventChanged$ = new BehaviorSubject(null);
    }
    public static get instance(): LoaderService {
      if (this._instance == null) {
          this._singletonEnforcer = true;
          this._instance = new LoaderService();
          this._singletonEnforcer = false;
      }
      return this._instance;
   }
   show( ) {
   this.eventChanged$.next('show');
  }
  close( ) {
    this.eventChanged$.next('hide');
   }

}
