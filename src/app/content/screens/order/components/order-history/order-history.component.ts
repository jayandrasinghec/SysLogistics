import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { HttpClient } from 'selenium-webdriver/http';
import { ValidateService } from 'src/app/services/validate.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import AuthService from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import {LoaderService} from '../../../../../services/loader.service';
import { UtilsService } from 'src/app/services/Utils.service';
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderHistoryComponent implements OnInit {

  model: BookingOrder;
  authService:any;
  previousUrl:string;
  userName:any;
  orderHistory: any[];

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private bookingService: BookingService,
              private localStorageService: LocalStorageService,
	       private utilsService: UtilsService
              ) {

                ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('id');
                this.model = new BookingOrder();
                this.model.order_ID = activatedRoute.snapshot.paramMap.get('id') || this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`);
                this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
                this.authService = AuthService.getInstance();
                if (this.authService.hasToken) {
                  this.fetchDataLoad();
                } else {
                  this.router.navigateByUrl("login");
                }
  }

  ngOnInit() {
    LoaderService.instance.show();
  }

  closeBtnClickHandler(event){
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.router.navigateByUrl(this.previousUrl);
  }

  fetchDataLoad() {
   if (this.model.order_ID) {
      this.bookingService.getOrderHistoryData(this.model.order_ID).subscribe( (result: any) => {
        LoaderService.instance.close();
        this.orderHistory = result;
        this.userName = AuthService.getInstance().userName;
      });
    }
  }
  getDate(dateTime:any){
    return this.utilsService.getDisplayDate(dateTime)
  }

  getTime(dateTime:any){
    return this.utilsService.getDisplayTime_hhmmss(dateTime)
  }
}
