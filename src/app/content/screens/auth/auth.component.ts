import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit, OnDestroy {

@Input() action = '';
constructor(private route: ActivatedRoute, private router: Router) {
    //this.route.queryParamMap.subscribe(params => { });

}

ngOnInit(): void {

}
ngOnDestroy(): void {

}

login() {
this.router.navigate(['/signin']);
}

register_options() {
this.router.navigate(['/signup']);
}


register_as_club_leader() {
this.action = 'register_as_club_leader';
}

register_as_student() {
this.action = 'register_as_student';
}

register_as_parent() {
this.action = 'register_as_parent';
}

register_as_business_owner() {
this.action = 'register_as_business_owner';
}


}
