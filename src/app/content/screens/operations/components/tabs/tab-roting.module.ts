import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TabsComponent} from './tabs.component';
import {PickupComponent} from '../pickup/pickup.component';
import {DeliveryComponent} from '../delivery/delivery.component';
import {AirlineComponent} from '../airline/airline.component';
import {OrderGuard} from '../../../../../core/guards/order.guard';
const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
         /*-------------Components--------------------------*/                
        {
            path: 'pickup/:orderid',
            component: PickupComponent,
            canActivate: [OrderGuard],
        },
        {
            path: 'delivery/:orderid',
            component: DeliveryComponent,
            canActivate: [OrderGuard],
         },
         {
            path: 'airline/:orderid',
            component: AirlineComponent,
            canActivate: [OrderGuard],
         }           
    ]
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule {}
