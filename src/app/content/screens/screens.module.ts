import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreensRoutingModule } from './screens-routing.module';
import { SpecialChargesComponent } from '../screens/booking/components/origin-destination-freight/special-charges/special-charges.component';
import {  ViewChargesComponent } from '../screens/booking/components/origin-destination-freight/view-charges/view-charges.component';
import {  CalculateDimensionsComponent } from '../screens/booking/components/origin-destination-freight/calculate-dimensions/calculate-dimensions.component';
import {OrigindestinationFreightService} from '../../services/origin-destination-freight.service';
import {OrderSearchService} from '../../services/order-search.service';
import {MatTabsModule} from '@angular/material/tabs';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
//import {PhoneNumberPipe} from '../../core/pipes/phone-number.pipe';
import {MenuComponent} from '../layout';

import {InputNumberComponent} from '../partials/components/input-number/input-number';
import {
  AppLayoutComponent,
  AsideComponent,
  FooterComponent,
  HeaderComponent,
  SubHeaderComponent } from '../layout';
import {ScreensComponent} from './screens.component';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import {DashboardService} from 'src/app/services/dashboard.service';
import { MatSelectModule } from '@angular/material/select';
import { DimensionsViewComponent } from './booking/components/origin-destination-freight/dimensions-view/dimensions-view.component';
const COMPONENTS = [
  ScreensComponent,
  AppLayoutComponent,
  AsideComponent,
  FooterComponent,
  HeaderComponent,
  SubHeaderComponent,
  SpecialChargesComponent,
  ViewChargesComponent,
  InputNumberComponent,
  MenuComponent,
  CalculateDimensionsComponent,
  DimensionsViewComponent
];

@NgModule({
  imports: [
    CommonModule,
    ScreensRoutingModule,
    MatTabsModule,
    PerfectScrollbarModule,
    MatSelectModule
    //PhoneNumberPipe,
  ],
  declarations: [COMPONENTS],
  providers: [
    OrigindestinationFreightService,
    LocalStorageService,
    DashboardService,
    OrderSearchService
    ],
  exports: [
    CalculateDimensionsComponent,
    SpecialChargesComponent
  ]

})
export class ScreensModule { }
