import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ApplicationService{


  private static _instance: ApplicationService = null;
  private static _singletonEnforcer: boolean;
   private  routerURL:string;
   private  bookingID:string;
   private  orderID:string;
   private orderStatus: string; //FRESH_ORDER,EDIT_ORDER,SAVED_ORDER
    constructor() {
      if (!ApplicationService._singletonEnforcer) {
        throw new Error('This is a singleton class. Use ApplicationService.instance to get the instance!!');
       }
    }
    public static get instance(): ApplicationService {
      if (this._instance == null) {
          this._singletonEnforcer = true;
          this._instance = new ApplicationService();
          this._singletonEnforcer = false;
      }
      return this._instance;
   }
   public set routerLink(val:string){
      this.routerURL = val ;
   }
   public get routerLink() {
    return this.routerURL  ;
 }

  public set booking_id(val:string){
  this.bookingID = val ;
  }
  public get booking_id() {
  return this.bookingID  ;
  }

  public set order_id(val:string){
    this.orderID = val ;
    }
    public get order_id() {
    return this.orderID  ;
    }
  public set order_status(status: string) {
    this.orderStatus = status ;
  }
  public get order_status() {
    return this.orderStatus;
  }

}
