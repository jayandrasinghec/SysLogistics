import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import AuthService from 'src/app/services/auth.service';
import {LocalStorageService} from '../../services/localstorage.service';
import { HttpClient } from '@angular/common/http';
import { ApplicationService } from 'src/app/services/application.service';
@Injectable({ providedIn: 'root' })
export class OrderGuard implements CanActivate {
    constructor(private router: Router, private http: HttpClient, private lcStorage: LocalStorageService ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const currentUser = this.lcStorage.getItem('shoTrackToken');
        const orderID = route.params.orderid;
        if(orderID){
            ApplicationService.instance.order_id = orderID;
        }

        if (currentUser && currentUser !== 'Bearer undefined' && orderID ) {
            // authorised and orderID so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}
