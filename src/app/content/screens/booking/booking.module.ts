import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import { MatDatepickerModule,MatNativeDateModule,MatInputModule} from '@angular/material';
import {SharedModule} from '../shared/shared.module';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';


import { BookingComponent } from './booking.component';
import {OrigindestinationFreightComponent} from './components/origin-destination-freight/origin-destination-freight';
import { AddressComponent } from './components/origin-destination-freight/address/address.component';
import {FreightComponent} from './components/origin-destination-freight/freight/freight.component';
import {BillToComponent} from './components/billto/billto.component';
import {CustomerNotificationComponent} from './components/customernotification/customernotification';
import {NotesComponent} from './components/notes/notes.component';

import {BookingRoutingModule} from '../booking/booking-routing-module';
/*import {InputTextComponent} from '../../partials/components/inputtext/inputtext.component';
import {DropDownComponent} from '../../partials/components/dropdown/dropdown.component';
import {ZIPCodeComponent} from '../../partials/components/zip-code/zip-code.component';
import {NavigationComponent} from '../../partials/components/navigation/navigation.component';

import {AutopopulateInputTextComponent} from '../../partials/components/autopopulate-inputtext/autopopulate-inputtext.component'
import {DropdownGridComponent} from '../../partials/components/dropdown-grid/dropdown-grid.component'
import {PhoneNumberComponent} from '../../partials/components/phone-number/phone-number'
import {DollarInputComponent} from '../../partials/components/input-dollar/input-dollar';


import {EmailDirective} from '../../../core/directives/email.directive';
import {PhoneNumberPipe} from '../../../core/pipes/phone-number.pipe';
import {PhoneNumberDirective} from '../../../core/directives/phone.directive';
import {TimePipe} from '../../../core/pipes/timepipe';
import {SearchFilterPipe} from '../../../core/pipes/searchFiler.pipe';*/

import { BillToService } from '../../../services/billto.service';
import { BookingService } from '../../../services/booking.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { OrigindestinationFreightService } from "../../../services/origin-destination-freight.service";
import {LocalStorageService} from '../../../services/localstorage.service';
import {UtilitiesService} from '../../../services/utilities.service';
import {CustomerNotificationService} from '../../../services/customerNotification.service';
import { from } from 'rxjs';
import { InputNotesComponent } from '../../partials/components/input-notes/input-notes.component';
import { NotesService } from 'src/app/services/notes.service';
@NgModule({
imports: [
  BookingRoutingModule,
CommonModule,
FormsModule,
MatTabsModule,
MatNativeDateModule,
MatInputModule,
MatDatepickerModule,
PerfectScrollbarModule,
MatMomentDateModule,
SharedModule
// RouterModule.forChild([
//     {
//     path: '',
//     component: BookingComponent
//     }
// ])
],
  providers: [
    BillToService,
    BookingService,
    OrigindestinationFreightService,
    LocalStorageService,
    UtilitiesService,
    CustomerNotificationService,
    NotesService,
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ],
entryComponents: [

],
declarations: [
  BookingComponent,
  OrigindestinationFreightComponent,
  AddressComponent,
  FreightComponent,
  BillToComponent,
  CustomerNotificationComponent,
  NotesComponent,
  /* InputTextComponent,
  DropDownComponent,
  ZIPCodeComponent,
  NavigationComponent,
  EmailDirective,
  PhoneNumberDirective,
   TimePipe,
  SearchFilterPipe,
  AutopopulateInputTextComponent,
  DropdownGridComponent,
  PhoneNumberComponent,
  PhoneNumberPipe,
  DollarInputComponent,
  InputNotesComponent*/
  ],
  exports: [
    OrigindestinationFreightComponent,
    AddressComponent,
    FreightComponent,
    BillToComponent,
    CustomerNotificationComponent,
    NotesComponent,
  ]
})
export class BookingModule {}
