import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Routes, RouterModule } from '@angular/router';
import {NotesRoutingModule} from '../notes/notes-routing.module';
import { NotesComponent } from '../notes/notes.component';
import { PickupDeliveryNotesComponent } from '../notes/component/pickup-delivery-notes/pickup-delivery-notes.component';
import { TransferNotesComponent } from '../notes/component/transfer-notes/transfer-notes.component';
import { RoutingNotesComponent } from '../notes/component/routing-notes/routing-notes.component';



import { MatTabsModule } from '@angular/material';
import { from } from 'rxjs';
import { CommonModule } from '@angular/common';
// const routes: Routes = [
//   { path: '', redirectTo: 'pickup-delivery-note', pathMatch: 'full' },
//   { path: 'pickup-delivery-note', component: PickupDeliveryNotesComponent },
//   { path: 'tranfer-note', component: TransferNotesComponent},
//   { path: 'routing-note', component: RoutingNotesComponent},
// ];

@NgModule({
  imports: [
    NotesRoutingModule,
    FormsModule,
    MatTabsModule,
    CommonModule
  ],
  declarations: [
    NotesComponent,
    PickupDeliveryNotesComponent,
    TransferNotesComponent,
    RoutingNotesComponent
  ],
  bootstrap: []
})
export class OpsNotesModule { }
