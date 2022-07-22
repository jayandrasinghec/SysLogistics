import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import {MenuComponent } from '../../layout';

@NgModule({
imports: [
CommonModule,
FormsModule,
RouterModule.forChild([
  {
  path: '',
  component: DashboardComponent
  }
])
],
providers: [],
entryComponents: [

],
declarations: [
  DashboardComponent,
  // MenuComponent
]
})
export class DashBoardModule {}
