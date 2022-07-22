import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {OrigindestinationFreightComponent} from '../booking/components/origin-destination-freight/origin-destination-freight';
import {BillToComponent} from '../booking/components/billto/billto.component';
import {CustomerNotificationComponent} from '../booking/components/customernotification/customernotification';
import {NotesComponent} from '../booking/components/notes/notes.component';

import { EditBookingComponent } from './edit-booking.component';
const routes: Routes = [
  {
    path: '',
    component: EditBookingComponent,
    children: [

        {
            path: 'origin-destination-freight/:orderId',
            component: OrigindestinationFreightComponent
        },
        {
            path: 'billto/:orderId',
            component: BillToComponent
         },
        {
            path: 'customernotification/:orderId',
            component: CustomerNotificationComponent
        },
        {
            path: 'notes/:orderId',
            component: NotesComponent
        },
    ]

  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditBookingRoutingModule {}
