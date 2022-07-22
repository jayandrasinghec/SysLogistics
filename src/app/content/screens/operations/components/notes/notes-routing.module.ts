import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotesComponent } from '../notes/notes.component';
import { PickupDeliveryNotesComponent } from '../notes/component/pickup-delivery-notes/pickup-delivery-notes.component';
import { TransferNotesComponent } from '../notes/component/transfer-notes/transfer-notes.component';
import { RoutingNotesComponent } from '../notes/component/routing-notes/routing-notes.component';
import { OrderGuard } from 'src/app/core/guards/order.guard';

const routes: Routes = [
  {
    path: '',
    component: NotesComponent,
    children: [       
      { 
        path: 'pickup-delivery-note/:orderid', 
        component: PickupDeliveryNotesComponent,
        canActivate: [OrderGuard],
      },
      { 
        path: 'tranfer-note/:orderid', 
        component: TransferNotesComponent,
        canActivate: [OrderGuard],
      },
      { 
        path: 'routing-note/:orderid', 
        component: RoutingNotesComponent,
        canActivate: [OrderGuard],
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotesRoutingModule {}
