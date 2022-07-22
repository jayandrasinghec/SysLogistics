import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EditBookingRoutingModule} from './edit-booking-routing.module';
import {SharedModule} from '../shared/shared.module';
import {BookingModule} from '../booking/booking.module';

import {MatTabsModule} from '@angular/material/tabs';
import { MatDatepickerModule,MatNativeDateModule,MatInputModule} from '@angular/material';


import {EditBookingComponent} from './edit-booking.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';

@NgModule({
  declarations: [
    EditBookingComponent
  ],
  imports: [
    CommonModule,
    EditBookingRoutingModule,
    SharedModule,
    BookingModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule
  ],
  providers : [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ],
})
export class EditBookingModule { }
