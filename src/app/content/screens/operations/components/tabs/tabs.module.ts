import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs.component';
import {SharedModule} from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import {TabsRoutingModule} from './tab-roting.module';
import {MatTabsModule} from '@angular/material/tabs';

import { PickupComponent } from '../pickup/pickup.component';
import { DeliveryComponent } from '../delivery/delivery.component';
import { AirlineComponent } from '../airline/airline.component';
import { OperationsFooterComponent } from '../common/operations_footer/operations_footer.component';
@NgModule({
  declarations: [TabsComponent,
    PickupComponent,
    DeliveryComponent,
    AirlineComponent,
    OperationsFooterComponent
  ],
  imports: [
    CommonModule,
    TabsRoutingModule,
    CommonModule,
    FormsModule,
    MatTabsModule,
    SharedModule,
  ]
})
export class TabsModule { }
