import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { UserIdleModule } from 'angular-user-idle';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ScreensModule } from './content/screens/screens.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ConfirmationPopupComponent } from './content/partials/components/confirmation-popup/confirmation-popup.component';
import {SpinningLoaderComponent} from './content/partials/components/spinning-loader/spinning-loader.component'
import {LoaderAnimationComponent} from './content/partials/components/spinning-loader/loader-animation/loader-animation.component';
import {AuthInterceptor} from './core/interceptor/auth.intercept';
import {TimerPopupComponent} from './content/partials/components/timer-popup/timer-popup.component'
@NgModule({
  declarations: [
    AppComponent,
    ConfirmationPopupComponent,
    SpinningLoaderComponent,
    LoaderAnimationComponent,
    TimerPopupComponent
  ],
  entryComponents: [
    ConfirmationPopupComponent,
    SpinningLoaderComponent,
    LoaderAnimationComponent,
    TimerPopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ScreensModule,
    PerfectScrollbarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    UserIdleModule.forRoot({idle: 1800, timeout: 60, ping: 120})
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor ,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
