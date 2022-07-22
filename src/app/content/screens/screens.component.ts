import { Component, OnInit } from '@angular/core';

import { MENU_ITEMS } from '../../config/menu';
import {OrderSearchService} from '../../services/order-search.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {  ApplicationService} from '../../services/application.service';
import {LocalStorageService} from '../../services/localstorage.service';
@Component({
  selector: 'app-pages',
  styleUrls: ['screens.component.scss'],
  templateUrl: 'screens.component.html'
})
export class ScreensComponent implements  OnInit {

  menu = MENU_ITEMS;
  orderSerchSubscription: Subscription;

  constructor(private orderService: OrderSearchService, private router: Router,private localStorage:LocalStorageService) {



  }
  ngOnInit() {
    this.orderSerchSubscription = this.orderService.onSearchResult().subscribe((data) => {
      if (data) {
        this.localStorage.saveData(`${data.order_ID}:order`  , JSON.stringify(data));
        this.localStorage.saveData(`${data.order_ID}:view_booking_id`, data.booking_ID);
        this.localStorage.saveData(`${data.order_ID}:view_order_id`, data.order_ID);

        ApplicationService.instance.order_id = data.order_ID;
        ApplicationService.instance.booking_id = data.booking_ID;
        this.router.navigateByUrl(`view-booking/origin-destination-freight/${data.order_ID}`, { state: data });
      }
    });
  }

}
