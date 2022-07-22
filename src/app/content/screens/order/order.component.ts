import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation, ViewChild, ChangeDetectorRef} from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationService } from 'src/app/services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import BookingOrder from 'src/app/core/models/booking-order.model';

import { RoutingService } from 'src/app/services/routing.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent implements OnInit, OnDestroy {
ribbonModel: any;
orderModel: BookingOrder;
public progress = 0;
public description:string;
private destroy$: Subject<boolean> = new Subject<boolean>();

constructor(private router: Router,
            private localStorageService: LocalStorageService,
            private routingService: RoutingService) {

            }
fetchLoad() {
              this.localStorageService.getData(`${ApplicationService.instance.order_id}:order`).subscribe((result) => {
                if (result) {
                  this.ribbonModel = JSON.parse(result);
                  this.orderModel=this.ribbonModel;
                }
              });
              this.getRoutingStatus(ApplicationService.instance.order_id);
}

ngOnInit(): void {
this.fetchLoad();
}

ngOnDestroy(): void {

}

getRoutingStatus(orderId) {
  this.routingService.getRoutingStatus(orderId).pipe(takeUntil(this.destroy$)).subscribe((result)=> {
    if(result.length) {
      this.progress = result[0].percent_Complete;
      this.description=result[0].description;
    }
    else {
      this.progress = 0;
      this.description = '';
    }
  });
}
}
