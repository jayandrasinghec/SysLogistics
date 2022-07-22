import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ScreensComponent } from './screens.component';
import { SpecialChargesComponent } from 'src/app/content/screens/booking/components/origin-destination-freight/special-charges/special-charges.component';
import { ViewChargesComponent } from 'src/app/content/screens/booking/components/origin-destination-freight/view-charges/view-charges.component';
import { CalculateDimensionsComponent } from 'src/app/content/screens/booking/components/origin-destination-freight/calculate-dimensions/calculate-dimensions.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { DimensionsViewComponent } from './booking/components/origin-destination-freight/dimensions-view/dimensions-view.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
      path: 'dashboard',
      component: ScreensComponent,
      canActivate: [AuthGuard],
      loadChildren: () => import('./dashboard/dashboard.module')
      .then(m => m.DashBoardModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module')
    .then(m => m.AuthModule),
  },
  {
     path: 'signup',
     loadChildren: () => import('./auth/auth.module')
     .then(m => m.AuthModule),
  },
  {
  path: 'booking',
  component: ScreensComponent,
  canActivate: [AuthGuard],
  loadChildren: () => import('./booking/booking.module').then(m => m.BookingModule)
  },
  {
    path: 'view-booking',
    component: ScreensComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./edit-booking/edit-booking.module').then(m => m.EditBookingModule)
  },
  {
    path: 'edit-booking',
    component: ScreensComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./edit-booking/edit-booking.module').then(m => m.EditBookingModule)
  },
  {
    path: 'specialcharges/:id/:type',
    canActivate: [AuthGuard],
    component: SpecialChargesComponent
  },
  {
    path: 'viewcharges/:id/:type',
    canActivate: [AuthGuard],
    component: ViewChargesComponent
  },
  {
    path: 'calculatediamensions/:id',
    canActivate: [AuthGuard],
    component: CalculateDimensionsComponent
  },  
  {
    path: 'calculatediamensions/:orderid/:id',
    canActivate: [AuthGuard],
    component: CalculateDimensionsComponent
  },
  {
    path: 'viewdimensions/:id',
    canActivate: [AuthGuard],
    component: DimensionsViewComponent
  },
  {
    path: 'order',
    component: ScreensComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./order/order.module').then(m => m.OrderModule)
  },
  {
    path: 'operations',
    component: ScreensComponent,
    
    loadChildren: () => import('./operations/operations.module').then(m => m.OperationsModule),
    runGuardsAndResolvers: 'always'
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScreensRoutingModule {}
