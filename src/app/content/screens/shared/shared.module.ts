import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule,MatNativeDateModule,MatInputModule, MatSliderModule} from '@angular/material';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import { ActiveReportsModule } from '@grapecity/activereports-angular';

import {InputTextComponent} from '../../partials/components/inputtext/inputtext.component';
import {DropDownComponent} from '../../partials/components/dropdown/dropdown.component';
import {ZIPCodeComponent} from '../../partials/components/zip-code/zip-code.component';
import {NavigationComponent} from '../../partials/components/navigation/navigation.component';
import { InputNotesComponent } from '../../partials/components/input-notes/input-notes.component';
import {AutopopulateInputTextComponent} from '../../partials/components/autopopulate-inputtext/autopopulate-inputtext.component'
import {DropdownGridComponent} from '../../partials/components/dropdown-grid/dropdown-grid.component'
import {PhoneNumberComponent} from '../../partials/components/phone-number/phone-number'
import {DollarInputComponent} from '../../partials/components/input-dollar/input-dollar';
import {RibbonComponent} from '../../partials/components/ribbon/ribbon.component'
import { ReportComponent } from '../../partials/components/report/report.component';

import {EmailDirective} from '../../../core/directives/email.directive';
import {PhoneNumberPipe} from '../../../core/pipes/phone-number.pipe';
import {PhoneNumberDirective} from '../../../core/directives/phone.directive';
import {TimePipe} from '../../../core/pipes/timepipe';
import {SearchFilterPipe} from '../../../core/pipes/searchFiler.pipe';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {StatusCodeFilterPipe} from '../../../core/pipes/statusCode.pipe'
import { StatusBarComponent } from '../operations/components/common/status-bar/status-bar.component';
import { TextareaComponent } from '../../partials/components/textarea/textarea.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatNativeDateModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    PerfectScrollbarModule,
    MatMomentDateModule,
    ActiveReportsModule,
    MatSliderModule

  ],
  providers : [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ],
  declarations: [
    InputTextComponent,
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
    InputNotesComponent,
    RibbonComponent,
    StatusCodeFilterPipe,
    ReportComponent,
    StatusBarComponent,
    TextareaComponent
  ],
  exports: [
    InputTextComponent,
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
    InputNotesComponent,
    RibbonComponent,
    StatusCodeFilterPipe,
    ReportComponent,
    StatusBarComponent,
    TextareaComponent
  ],
   entryComponents: [ReportComponent]

})
export class SharedModule { }
