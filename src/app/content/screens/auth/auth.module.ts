import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import {LoginComponent} from './login/login.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {AuthRoutingModule} from './auth-routing.module';

@NgModule({
imports: [
CommonModule,
FormsModule,
AuthRoutingModule
],
providers: [],
entryComponents: [

],
declarations: [
  AuthComponent,
  LoginComponent
]
})
export class AuthModule {}
