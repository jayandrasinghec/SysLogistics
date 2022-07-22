import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {OperationsComponent} from './operations.component';
import {PickupComponent} from './components/pickup/pickup.component';
import {DeliveryComponent} from './components/delivery/delivery.component';
import {AirlineComponent} from './components/airline/airline.component';
//import {TabsComponent} from './components/tabs/tabs.component'
/*-----------------------*/
import {CarriersComponent} from './components/airline/carriers/carriers.component';



import {OrderGuard} from '../../../core/guards/order.guard';
import { ActualWeightComponent } from './components/common/actual-weight/actual-weight.component';
import {CalculateDimensionsComponent} from '../booking/components/origin-destination-freight/calculate-dimensions/calculate-dimensions.component';
import { SpecialChargesComponent } from '../booking/components/origin-destination-freight/special-charges/special-charges.component';

import {ConsolidateOrdersComponent} from '../order/components/consolidate-orders/consolidate-orders.component';
import {NomoveStatusComponent} from '../order/components/nomove-status/nomove-status.component';
import { FieldServiceRepComponent } from './components/common/field-service-rep/field-service-rep.component';

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
 
const routes: Routes = [
  {
    path: '',
    component: OperationsComponent,
    children: [
         /*-------------Components--------------------------*/
         {
          path: '',
          loadChildren: () => import('./components/tabs/tabs.module')
          .then(m => m.TabsModule),
        },
        {
          path: 'notes',
          loadChildren: () => import('./components/notes/notes.module')
          .then(m => m.OpsNotesModule),
        },
        /*--------Sub button pages routing-------------*/
        {
          path: 'airline/carriers/:orderid',
          canActivate: [OrderGuard],
          component: CarriersComponent,
        },
        {
        path: 'actualweight/:tabId/:orderid',
        canActivate: [OrderGuard],
        component: ActualWeightComponent,
        },
        {
          path: 'calculatediamensions/:tabId/:orderid/:id',
          canActivate: [OrderGuard],
          component: CalculateDimensionsComponent,
        },
        {
          path: 'specialcharges/:orderid/:id/:type',
          canActivate: [OrderGuard],
          component: SpecialChargesComponent
        }
        /*--------Main button pages routing-------------*/
        ,
        {
          path: 'consolidateorder/:orderid',
          canActivate: [OrderGuard],
          component: ConsolidateOrdersComponent
        },
        {
          path: 'nomovestatus/:orderid',
          canActivate: [OrderGuard],
          component: NomoveStatusComponent

        },
        {
          path: 'fieldservicerep/:orderid',
          canActivate: [OrderGuard],
          component: FieldServiceRepComponent

        },
        {
          path: 'filemanager/:tabId/:orderid',
          canActivate: [OrderGuard],
          component: FileManagerComponent

        },
        {
          path: 'filemanager/:tabId/uploadfile/:orderid',
          canActivate: [OrderGuard],
          component: FileUploadsComponent
        },
       {
          path: 'label/:tabId/:orderid',
          canActivate: [OrderGuard],
          component: LabelComponent

        },
        { 
          path: 'alert/:type/:orderid', 
          canActivate: [OrderGuard],
          component: AlertComponent 
        },
        {
          path: 'gateway-transferpicture',
          component: GatewayTransferpictureComponent
        },
        // {
        //   path: 'proof-of-delivery',
        //   component: ProofOfDeliveryComponent
        // },
        { 
          path: 'customer-service-search/:tabId/:orderid', 
           canActivate: [OrderGuard],
          component: CustomerServiceSearchComponent 
        },
        { 
          path: 'service-failure/:tabId/:orderid', 
          canActivate: [OrderGuard],
          component: ServiceFailureComponent 
        },
        { 
          path: 'service-failure/add-service-failure', 
          component: AddServiceFailureComponent 
        },
        { 
          path: 'change_agent/:tabId/:orderid', 
           canActivate: [OrderGuard],
          component: ChangeAgentComponent 
        },
         {
          path: 'labels/:tabId/:orderid',
          canActivate: [OrderGuard],
          component: FileManagerComponent

        },
        { 
          path: 'proof-of-pickup/:type/:orderid', 
          canActivate: [OrderGuard],
          component: ProofOfPickupOrDeliveryComponent 
        },
        { 
          path: 'proof-of-delivery/:type/:orderid', 
          canActivate: [OrderGuard],
          component: ProofOfPickupOrDeliveryComponent 
        }
    ]

  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationsRoutingModule {}
