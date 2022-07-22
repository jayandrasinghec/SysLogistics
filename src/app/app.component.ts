import { Component, HostListener } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';

import { HttpClient } from '@angular/common/http';
import AuthService from './services/auth.service';
import {LocalStorageService} from './services/localstorage.service';
import { Router, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute } from '@angular/router';
import { Subscription, fromEvent } from 'rxjs';
import { Messages } from './common/Messages';
import { DialogService } from './services/dialog.service';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private dialogRef: any ;
  title = 'ShoTrack';
  currentUrl;
  subscription: Subscription;
  constructor(private http: HttpClient,
              private localStorage: LocalStorageService,
              private router: Router,
              private userIdle: UserIdleService,
              private activatedRoute : ActivatedRoute,
              private dialogService : DialogService){
    AuthService.getInstance(http , localStorage);
    this.activatedRoute.url.subscribe(url =>{
          //console.log(url);
    });
  }

  ngOnInit() {
    this.clearSubscription();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
          // Show loading indicator
          LoaderService.instance.show();
      }

      if (event instanceof NavigationEnd) {
          // Hide loading indicator
          LoaderService.instance.close();
          this.currentUrl = event.urlAfterRedirects
          if(this.currentUrl != "/login"){
            this.clearSubscription();
            const down$ = fromEvent(document, 'mousedown')
            this.subscription = down$.subscribe(e => {this.restart();});
            this.restart();
            this.startWatching();
          } else {
            this.stop();
            this.stopWatching();
            this.clearSubscription()
          }
      }

      if (event instanceof NavigationError) {
          // Hide loading indicator
          LoaderService.instance.close();
          // Present error to user
          // console.log(event.error);
      }
    });
    //Start watching for user inactivity.
    // this.userIdle.startWatching();

    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe((count) => {
      this.showTimerPopup(count);
    });

    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => {
      this.removeDialogue();
      this.stop();
      this.stopWatching();
      AuthService.getInstance().clearUserData();
      this.showAlertPopup();
    });
    // this.userIdle.ping$.subscribe(() => {
    //   console.log("PING");
    // });
  }
  showTimerPopup(count) {
    if ( count != null && this.dialogRef === undefined) {
      this.dialogRef = this.dialogService.showTimerPopup(Messages.TIMEOUT_TITLE,'');
    }
    if (count != null && this.dialogRef !== undefined && this.dialogRef.componentInstance ) {
      this.dialogRef.componentInstance.count  = (this.userIdle.getConfigValue().timeout + 1) - count;
      this.dialogRef.afterClosed().subscribe(result => {
        if (result && result.clickedCancel) {
          this.dialogRef = undefined;
        }
      });
    }
  }
  showAlertPopup() {
    if (this.dialogRef === undefined) {
      this.dialogRef = this.dialogService.showInfoPopup(Messages.TIMEOUT_TITLE,Messages.SESSION_TIMEOUT)
      
      this.dialogRef.afterClosed().subscribe(result => {
        //if (result && result.clickedOkay) {
          this.localStorage.clearAll();
          this.router.navigateByUrl('login');
          this.dialogRef = undefined;
       // }
      });
    }
  }

  ngOnDestroy() {
    this.clearSubscription();
  }

  stop() {
    this.userIdle.stopTimer();
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  restart() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef.componentInstance = undefined;
      this.dialogRef  = undefined;
     }
    this.userIdle.resetTimer();
  }

  clearSubscription(){
    if(this.subscription){
      this.subscription.unsubscribe();
    }
    this.subscription = null;
  }
  removeDialogue() {
    if (this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef.componentInstance = undefined;
      this.dialogRef = undefined;
    }
  }
}
