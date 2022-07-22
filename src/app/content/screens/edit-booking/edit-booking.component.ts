import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation, ViewChild, ChangeDetectorRef} from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import {ValidateService} from '../../../services/validate.service';
import { ApplicationService } from 'src/app/services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import AuthService from 'src/app/services/auth.service';
import {OrderSearchService} from 'src/app/services/order-search.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { RoutingService } from 'src/app/services/routing.service';
import { takeUntil } from 'rxjs/operators';
import { BusinessRulesService } from 'src/app/services/business-rules.service';


@Component({
  selector: 'app-edit-booking',
  templateUrl: './edit-booking.component.html',
  styleUrls: ['./edit-booking.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditBookingComponent implements OnInit, OnDestroy {

/*-----------variables----------------*/
public progress = 0;
public description:string;
private destroy$: Subject<boolean> = new Subject<boolean>();
navLinks: any[];
tabStatus: Boolean[];
activeLinkIndex = 0;
showPrevBtn: boolean;
showNextBtn: boolean = true;
isEditable: boolean = false;
showEditBtn:boolean = false ;
showSaveOrderBtn: boolean = false;
orderBooked: boolean = false;
validateServiceSubscription: any;
routerSubscription: any;
orderModel: BookingOrder;
userName: any;
editOrder: boolean = false;


/*-----------INPUTS----------------*/
@Input() action = '';

constructor(private router: Router,
            private validateService: ValidateService,
            private cdr: ChangeDetectorRef,
            private activatedRoute: ActivatedRoute,
            private localStorageService: LocalStorageService,
            private orderSerchService: OrderSearchService,
            private utilsService : UtilsService,
            private routingService: RoutingService,
            private rulesService: BusinessRulesService
          ) {

            this.configNavTabs();
           /* this.localStorageService.getData(`order`).subscribe((result) => {
              if(result){
                this.saveOrderChanges();
                this.orderModel = JSON.parse(result);
                this.userName = AuthService.getInstance().userName;
              }
            })
            const orderId: string = activatedRoute.snapshot.paramMap.get('orderId');
            this.searchOrder(orderId);*/
              this.routerSubscription = this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                  this.init(event);
                }
              });
            }
init(event) {
  if (event instanceof NavigationEnd ) {
    this.localStorageService.getData(`${ApplicationService.instance.order_id}:order`).subscribe((result) => {
      if(result){
        this.saveOrderChanges();
        this.orderModel = JSON.parse(result);
        this.userName = AuthService.getInstance().userName;
      }
    })
    const orderId: string = this.activatedRoute.snapshot.paramMap.get('orderId');
    this.searchOrder(orderId);
    if (event.url.indexOf('edit-booking') !== -1) {
     // ApplicationService.instance.order_status = 'EDIT_ORDER';
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:edit_order_saved`);
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:order_status`, 'EDIT_ORDER');
      this.editOrder = true;
      this.isEditable = true; // for Hiding Edit Button
      this.showSaveOrderBtn = (event.url.indexOf('edit-booking/notes') !== -1 && !this.orderBooked ) ? true : false  ;
    }
    /*if(event.url.indexOf('view-booking') !== -1){
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:order_status`, 'VIEW_ORDER');
    }*/

    const pageurl = event.url.split('/')[2];
    const objNavItem = this.navLinks.filter(item => item.link.indexOf(pageurl) !== -1 );
    this.activeLinkIndex = objNavItem[0].index ;
    this.navLinks.forEach(navItem => {
      navItem.isActive = false;
    });
    this.navLinks[this.activeLinkIndex].isActive = true;
    this.showNextBtn = (this.activeLinkIndex === 3) ? false : true;
    this.showPrevBtn = (this.activeLinkIndex === 0) ? false : true;
    this.showEditBtn = (this.activeLinkIndex === 0) ? true : false;

    const edit =   this.localStorageService.getItem(`${ApplicationService.instance.order_id}:edit_order_saved`);
    if (edit === '1' && this.router.url.indexOf('notes') !== -1) {
      this.orderBooked = true;
    } else {
    this.orderBooked = false;
    }
    
  }
  this.getRoutingStatus(ApplicationService.instance.order_id);
}

ngOnInit(): void {
   this.validateServiceSubscription = this.validateService.validateCompleteEvent$.subscribe(response => {
      if (response && response !== null) { 
        this.changeTabAfterValidation(response)
      }   
    });
}

ngOnDestroy(): void {
  //this.localStorageService.clear('view_booking_id');
  this.validateServiceSubscription.unsubscribe();
  this.validateServiceSubscription = null;
  this.validateService.reset();
  this.routerSubscription.unsubscribe();
  this.routerSubscription = null;
  this.destroy$.next();
  // this.rulesService.clearRules();
}
configNavTabs() {
  this.navLinks = [
                  {   label: 'Origin-Destination-Freight',
                      link: '/view-booking/origin-destination-freight/%orderId%',
                      index: 0,
                      isActive: false,
                      isDisabled: false,
                      isFormEditable:false
                    },
                  {
                      label: ' Bill To',
                      link: '/view-booking/billto/%orderId%',
                      index: 1,
                      isActive: false,
                      isDisabled: false,
                      isFormEditable:false },
                  {
                      label: 'Customer Notification', 
                      link: '/view-booking/customernotification/%orderId%',
                      index: 2,
                      isActive: false, 
                      isDisabled: false,
                      isFormEditable:false
                  },
                  {
                    label: 'Notes', 
                    link: '/view-booking/notes/%orderId%',  
                    index: 3, 
                    isActive: false, 
                    isDisabled: false,
                    isFormEditable:false
                  }
                ];


}
navigationClickHandler(event) {
  switch (event.type) {
    case 'edit' :
    //this.editOrder = true;
    this.configEditMode();
    return ;
    break;
    case 'orderhistory':
    case 'consolidateorder':
    case 'nomovestatus':
    case 'ntscharges':
    if (this.editOrder) {
        event.tabIndex = this.activeLinkIndex;
        this.validateService.validateComponent(event);
    } else {
        this.router.navigateByUrl(event.path);
    }
    return;
    break;
  }
  if (this.editOrder) {
    if (event.type !== 'save') {
      event.tabIndex = this.activeLinkIndex;
    }
    this.validateService.validateComponent(event);
  } else {
    const isNext: boolean = (event.type === 'next') ? true : false;
    const newIndex = this.getNavigationTabIndex(isNext);
    this.navigateTab(newIndex);
  }
}


tabClickhandler(event, index) {
 // if (index === this.activeLinkIndex) {return; }
  if(this.editOrder){
    this.validateService.validateComponent({tabIndex: this.activeLinkIndex, newIndex: index, type:'tab'});
  }
  else{
    this.navigateTab(index);
  }

}

configEditMode() {
  //get updated rules before editing
  // TODO: need to unsubscribe this, but at present ng destroy get called unnecessary
  // this.rulesService.getRules(ApplicationService.instance.order_id)
  // .pipe()
  // .subscribe((rules)=> {
  //   this.rulesService.initilize(rules);

    this.editOrder = true;
    const BookingID = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_booking_id`);
    const orderData:any = this.localStorageService.getItem(`${BookingID}:bookingOrder`);
    this.localStorageService.saveData(`${BookingID}:editBookingOrder`, orderData);
 // });
}

/*--------- ON validateServiceSubscription-------------*/
changeTabAfterValidation(response) {
  if (response && response.order && response.order === 'saved') {
    this.showSaveOrderBtn = false ;
    this.saveOrderChanges();
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:edit_order_saved`, '1');
    this.localStorageService.getData(`${ApplicationService.instance.order_id}:order`).subscribe((result) => {
      if (result) {
        this.orderModel = JSON.parse(result);
        this.userName = AuthService.getInstance().userName;
      }
    });
    const url:any = this.router.url.replace('edit-booking', 'view-booking');
    this.router.navigateByUrl(url);
    this.editOrder = false;
    this.isEditable = false;
    response.order = '';
  } else {
          if ( response && response.isValid) {
                 switch (response.type) {/*-if response.type = orderhistory,consolidateorder,nomovestatus,ntscharges then it wil redirect*/
                    case 'orderhistory':
                    case 'consolidateorder':
                    case 'nomovestatus':
                    case 'ntscharges':
                    this.router.navigateByUrl(response.path);
                    return ;
                    break;
                  }
                 const isNextType = response.type === 'next';
                 const isTabClicked = response.type === 'tab';
                 this.activeLinkIndex = response.tabIndex;
                 const edit = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:edit_order_saved`);
                 if (edit === '1' && this.router.url.indexOf('notes')!== -1) {
                   this.orderBooked = true;
                 } else {
                  this.orderBooked = false;
                 }
                 if (!isTabClicked) {
                  const newIndex = this.getNavigationTabIndex(isNextType);
                  this.navigateTab(newIndex);
                } else{
                  this.navigateTab(response.newIndex);
                }
            }
        }
}
getNavigationTabIndex(isNext) {
   return  isNext ? this.activeLinkIndex + 1 : this.activeLinkIndex - 1;
}
navigateTab(index) {
  this.navLinks[this.activeLinkIndex].isActive = false;
  this.activeLinkIndex = index;
  this.navLinks[this.activeLinkIndex].isDisabled = false;
  this.activateTab();

}
activateTab() {
  this.navLinks[this.activeLinkIndex].isActive = true;
  const viewOrderId = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`);
  for (let navLink of this.navLinks) {
    if(this.isEditable) {
      navLink.link = navLink.link.replace('view-booking', 'edit-booking');
    }
    if (navLink.link.indexOf('%orderId%') !== -1) {
      navLink.link = navLink.link.replace('%orderId%', viewOrderId);
    }
    else {
      const slashLastIndex = navLink.link.lastIndexOf('/');
      navLink.link = navLink.link.substring(0, slashLastIndex) + '/' + viewOrderId + navLink.link.substring(navLink.link.length);
    }
  }
  this.router.navigate([this.navLinks[this.activeLinkIndex].link]);
  this.showNextBtn = (this.activeLinkIndex === 3) ? false : true;
  this.showPrevBtn = (this.activeLinkIndex === 0) ? false : true;
  this.showEditBtn = (this.activeLinkIndex === 0) ? true : false;
}
saveOrderChanges() {

 /* this.navLinks.forEach((navItem, index) => {
    navItem.isDisabled = true;
  });*/

  this.showNextBtn = false;
  this.showPrevBtn = false;
  this.showSaveOrderBtn = false;
  const edit =   this.localStorageService.getItem(`${ApplicationService.instance.order_id}:edit_order_saved`);
  if (edit === '1') {
    this.orderBooked = true;
  }


}
searchOrder(orderId: any) {
  if (orderId === undefined || orderId === null ){ return };
  this.orderSerchService.getOrderData(orderId).subscribe((result) => {
    if (result) {
      this.orderSerchService.searchresult.next(result);
    }
  });
}

getFormattedDateTime(dateTime){
  return this.utilsService.getDisplayDateTime(dateTime);
}

getRoutingStatus(orderId) {
  this.routingService.getRoutingStatus(orderId).pipe(takeUntil(this.destroy$)).subscribe((result)=> {
    if(result.length) {
      this.progress = result[0].percent_Complete;
      this.description=result[0].description;
    }
    else {
      this.progress = 0;
      this.description = '';
    }
  });
}

}
