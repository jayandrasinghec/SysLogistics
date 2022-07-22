import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { error } from 'selenium-webdriver';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router } from '@angular/router';
import { retry } from 'rxjs/internal/operators/retry';
import { tap, catchError } from 'rxjs/operators';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private dialogRef: any ;
  constructor(private dialogService : DialogService,
              private localStorageService: LocalStorageService,
              private router: Router
            ) { }
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  return next.handle(request).pipe( tap(() => {},
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
            if (err.status !== 401) {
            return;
            }
            this.showAlertPopup();
        }
      }
    ));
}

showAlertPopup() {
  if (this.dialogRef === undefined) {
    this.dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,Messages.SESSION_TIMEOUT);

    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.clickedOkay) {
        this.localStorageService.clearAll();
        this.router.navigateByUrl('login');
        this.dialogRef = undefined;

      }
    });
  }
}
}
