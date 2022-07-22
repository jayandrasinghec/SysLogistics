import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {OrigindestinationFreightComponent} from './components/origin-destination-freight/origin-destination-freight';
import {BillToComponent} from './components/billto/billto.component';
import {CustomerNotificationComponent} from './components/customernotification/customernotification';
import {NotesComponent} from './components/notes/notes.component';

import { BookingComponent } from './booking.component';
const routes: Routes = [
  {
    path: '',
    component: BookingComponent,
    children: [
        {
            path: '',
            redirectTo: 'billto/',
            pathMatch: 'full'
        },
        {
            path: 'origin-destination-freight/:id',
            component: OrigindestinationFreightComponent
        },
        {
            path: 'billto/:id',
            component: BillToComponent
         },
         {
            path: 'billto',
            component: BillToComponent
         },
        {
            path: 'customernotification/:id',
            component: CustomerNotificationComponent
        },
        {
            path: 'notes/:id',
            component: NotesComponent
        },
    ]

  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule {}
