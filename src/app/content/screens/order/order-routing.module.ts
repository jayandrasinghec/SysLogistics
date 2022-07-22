import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderComponent } from './order.component';
import {OrderHistoryComponent} from './components/order-history/order-history.component';
import {ConsolidateOrdersComponent} from './components/consolidate-orders/consolidate-orders.component';
import {NomoveStatusComponent } from './components/nomove-status/nomove-status.component';
import {NtsChargesComponent  } from './components/nts-charges/nts-charges.component';
//import { OdfViewComponent  } from './components/odf-view/odf-view.component';

const routes: Routes = [
  {
    path: '',
    component: OrderComponent,
    children: [
        {
            path: 'orderhistory/:id',
            component: OrderHistoryComponent
        },
        {
          path: 'consolidateorder/:id',
          component: ConsolidateOrdersComponent
        },
        {
          path: 'nomovestatus/:id',
          component: NomoveStatusComponent
        },
        {
          path: 'ntscharges/:id',
          component: NtsChargesComponent
        },
        /*{
          path: 'odfview/:id',
          component: OdfViewComponent
        }*/
    ]

  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]

})
export class OrderRoutingModule {}
