import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {  OrderComponent } from './order.component';

import {SharedModule} from '../shared/shared.module';
import { BookingService } from '../../../services/booking.service';
import {OrderRoutingModule} from './order-routing.module';

import {OrderHistoryComponent} from './components/order-history/order-history.component';
import {ConsolidateOrdersComponent} from './components/consolidate-orders/consolidate-orders.component';
import {NomoveStatusComponent} from './components/nomove-status/nomove-status.component';
import {NtsChargesComponent} from './components/nts-charges/nts-charges.component';
//import {OdfViewComponent} from './components/odf-view/odf-view.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import {NTSlistFilterPipe} from '../../../core/pipes/nts-list.pipe'

@NgModule({

  imports: [FormsModule, CommonModule, SharedModule, OrderRoutingModule, PerfectScrollbarModule],
  declarations: [ OrderComponent,
                  OrderHistoryComponent,
                  ConsolidateOrdersComponent,
                  NomoveStatusComponent,
                  NtsChargesComponent,
                  NTSlistFilterPipe
                  //OdfViewComponent
                ],
  providers: [BookingService],
  exports: [
    OrderHistoryComponent,
    ConsolidateOrdersComponent,
    NomoveStatusComponent,

  ]
})
export class OrderModule {}
