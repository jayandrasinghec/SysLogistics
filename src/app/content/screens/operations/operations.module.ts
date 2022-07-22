import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatTabsModule} from '@angular/material/tabs';
import { MatDatepickerModule,MatNativeDateModule,MatInputModule, MatTooltipModule} from '@angular/material';
import {OperationsRoutingModule} from './operations-routing.module';
import {SharedModule} from '../shared/shared.module'
import { FormsModule } from '@angular/forms';
import {ScreensModule} from '../screens.module';
import {OrderModule} from '../order/order.module';
import {BookingModule} from '../booking/booking.module'

import {UtilitiesService} from '../../../services/utilities.service';

import{OperationsComponent} from './operations.component';
import {RibbonOperationsComponent} from './components/common/ribbon-operations/ribbon-operations.component';
import { CarriersComponent } from './components/airline/carriers/carriers.component';
import { ActualWeightComponent } from './components/common/actual-weight/actual-weight.component';
import {OperationsService} from '../../../services/operation.service';
import {ModelService} from '../../../services/model.service';
import {BillToService} from '../../../services/billto.service';


import { FieldServiceRepComponent } from './components/common/field-service-rep/field-service-rep.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FileManagerComponent } from './components/common/file-manager/file-manager.component';
import { FileUploadsComponent } from './components/common/file-uploads/file-uploads.component';

import { LabelComponent } from './components/common/label/label.component';
import { AlertComponent } from './components/common/alert/alert.component';
import { ChangeAgentComponent } from './components/common/change-agent/change-agent.component';
import { CustomerServiceSearchComponent } from './components/common/customer-service-search/customer-service-search.component';
import { GatewayTransferpictureComponent } from './components/common/gateway-transferpicture/gateway-transferpicture.component';
import { ProofOfDeliveryComponent } from './components/common/proof-of-delivery/proof-of-delivery.component';
import { ServiceFailureComponent } from './components/common/service-failure/service-failure.component';
import { AddServiceFailureComponent } from './components/common/service-failure/add-service-failure/add-service-failure.component';
import { ProofOfPickupOrDeliveryComponent } from 'src/app/content/screens/operations/components/common/proof-of-pickup-or-delivery/proof-of-pickup-or-delivery.component';
import { TruckalertComponent } from './components/common/alert/truckalert/truckalert.component';
import { RoutingalertComponent } from './components/common/alert/routingalert/routingalert.component';
import { PickupAlertComponent } from './components/common/alert/pickup-alert/pickup-alert.component';
import { DeliveryAlertComponent } from './components/common/alert/delivery-alert/delivery-alert.component';

//import { PickupDeliveryNotesComponent } from './components/notes/component/pickup-delivery-notes/pickup-delivery-notes.component';
//import { TransferNotesComponent } from './components/notes/component/transfer-notes/transfer-notes.component';
//import { RoutingNotesComponent } from './components/notes/component/routing-notes/routing-notes.component';
//import { NotesComponent } from './components/notes/notes.component';

@NgModule({
  declarations: [
                 OperationsComponent,
                 RibbonOperationsComponent,
                 CarriersComponent,
                 ActualWeightComponent,
		             FieldServiceRepComponent,
		             FileManagerComponent,
		             FileUploadsComponent,
                 LabelComponent,
                 AlertComponent,
		             ChangeAgentComponent,
		             CustomerServiceSearchComponent,
		             GatewayTransferpictureComponent,
		             ProofOfDeliveryComponent,
		             ServiceFailureComponent,
                 AddServiceFailureComponent,
                 ProofOfPickupOrDeliveryComponent,
                 TruckalertComponent,
                 RoutingalertComponent,
                 PickupAlertComponent,
                 DeliveryAlertComponent
		            // PickupDeliveryNotesComponent,
		            // TransferNotesComponent,
		            // RoutingNotesComponent,
		             //NotesComponent
                ],
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTooltipModule,
    SharedModule,
    OperationsRoutingModule,
    ScreensModule,
    OrderModule,
    PerfectScrollbarModule,
    MatNativeDateModule,
    MatInputModule,
    MatDatepickerModule,
    BookingModule
  ],
  providers: [
    OperationsService,
    ModelService,
    UtilitiesService,
    BillToService
  ]
})
export class OperationsModule { }
