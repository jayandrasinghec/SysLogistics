import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation, ViewChild, ChangeDetectorRef} from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {InputTextComponent} from '../../partials/components/inputtext/inputtext.component';
import {ValidateService} from '../../../services/validate.service';
import { ApplicationService } from 'src/app/services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BookingComponent implements OnInit, OnDestroy {
navLinks: any[];
tabStatus: Boolean[];
activeLinkIndex = 1;
showPrevBtn: boolean;
showNextBtn: boolean = true;
orderBooked: boolean = false;
validateServiceSubscription:any;
orderModel:BookingOrder;
userName:any;
@Input() action = '';
constructor(private router:Router,
  private validateService:ValidateService,
  private cdr: ChangeDetectorRef,
  private activatedRoute:ActivatedRoute,
  private localStorageService:LocalStorageService,
  private utilsService : UtilsService) {
    this.orderModel = new BookingOrder();
    this.showNextBtn = true;
    this.orderBooked = false;
    // this.showPrevBtn = true;

    const trimmedURL = this.router.url.replace('/booking/origin-destination-freight', "")
                                      .replace('/booking/billto', "")
                                      .replace('/booking/customernotification', "")
                                      .replace('/booking/notes', "").replace("/", "").trim();
    const enableTab = trimmedURL.length == 0
    this.navLinks = [
      {
          label: 'Origin-Destination-Freight',
          link: '/booking/origin-destination-freight/%bookingId%',
          index: 0,
          isActive: false,
          isDisabled:enableTab
      },
      {
          label: ' Bill To',
          link: '/booking/billto/%bookingId%',
          index: 1,
          isActive: false,
          isDisabled:false
      },
      {
          label: 'Customer Notification',
          link: '/booking/customernotification/%bookingId%',
          index: 2,
          isActive: false,
          isDisabled:enableTab
      },
      {
        label: 'Notes',
        link: '/booking/notes/%bookingId%',
        index: 3,
        isActive: false,
        isDisabled:enableTab
    },
    ];
    if(!enableTab){
        this.localStorageService.getTabStatusData(`${trimmedURL}:tabstatus`).subscribe((result) => {
          this.tabStatus = result as Boolean[];
          this.navLinks.forEach((navItem, index)=>{
            navItem.isDisabled = this.tabStatus[index]
          })
        })
    }

    this.setActiveIndexOnLoad(this.router.url)  ;
    this.router.events.subscribe((res) => {
          this.showPrevBtn = this.router.url.indexOf('/billto') === -1 ;
          this.showNextBtn = this.router.url.indexOf('/notes') === -1 ;
    });

    this.localStorageService.getData(`${ApplicationService.instance.order_id}:order`).subscribe((result) => {
        if(result && result != "undefined"){
          this.saveOrderChanges();
          this.orderModel = JSON.parse(result);
          this.userName = AuthService.getInstance().userName;
        }

      });
}

ngOnInit(): void {
  //ApplicationService.instance.order_status = 'FRESH_ORDER';
  //this.localStorageService.saveData(`order_status:${ApplicationService.instance.order_id}`,'FRESH_ORDER');
  this.validateServiceSubscription = this.validateService.validateCompleteEvent$.subscribe(response => { if(response){ this.changeTabAfterValidation(response)}   } );
}

ngOnDestroy(): void {
  this.activeLinkIndex = 1;
  this.tabStatus = [];
  this.navLinks = [];
  this.validateServiceSubscription.unsubscribe();
  this.validateServiceSubscription = null;
  this.validateService.reset();
}
navigationClickHandler(event){
    if(event.type != 'save'){
      event.tabIndex = this.activeLinkIndex;
    }
    this.validateService.validateComponent(event);
}

navigateTab(index) {
  this.navLinks[this.activeLinkIndex].isActive = false;
  this.activeLinkIndex = index;
  this.navLinks[this.activeLinkIndex].isDisabled = false;
  this.activateTab();
}

getNavigationTabIndex(isNext){
  switch (this.activeLinkIndex) {
    //ODF
    case 0:
     return isNext ? 2 : 1;
    //BillTo
    case 1:
    return isNext ? 0 : this.activeLinkIndex;
    //CustNoti
    case 2:
    return isNext ? 3 : 0;
    case 3:
    return  isNext ? this.activeLinkIndex : 2;
  }
  return this.activeLinkIndex
}

setActiveIndexOnLoad(url)
{
  if(url.indexOf('billto') != -1 )
  {
    this.activeLinkIndex = 1

  }
  else if(url.indexOf('origin-destination-freight') != -1 )
  {
    this.activeLinkIndex = 0;
  }
  else if(url.indexOf('customernotification') != -1 )
  {
    this.activeLinkIndex = 2;
  }
  else if(url.indexOf('notes') != -1 )
  {
    this.activeLinkIndex = 3;
  }
  this.navLinks[this.activeLinkIndex].isActive = true;
}

activateTab(){
  if(ApplicationService.instance.booking_id+"" === '0') {
    for(let navLink of this.navLinks){
      if(navLink.index != 1){
        navLink.isDisabled = true
      }
    }
    this.activeLinkIndex = 1;
    return;
  };
  this.navLinks[this.activeLinkIndex].isActive = true;
  for(let navLink of this.navLinks){
    navLink.link = navLink.link.replace('%bookingId%', ApplicationService.instance.booking_id)
  }
  this.router.navigate([this.navLinks[this.activeLinkIndex].link])
  this.showNextBtn =(this.activeLinkIndex== 3) ? false:true;
  this.showPrevBtn = (this.activeLinkIndex === 1) ? false : true;

}

changeTabAfterValidation(response){
  if(response.order && response.order == 'saved'){
    this.saveOrderChanges();
    this.localStorageService.getData(`${ApplicationService.instance.order_id}:order`).subscribe((result) => {
      if(result){
        this.orderModel = JSON.parse(result);
        this.userName = AuthService.getInstance().userName;
      }
    });
    response.order = '';
  }
  else{
  if (response.isValid) {
      let isNextType = response.type == 'next';
      let isTabClicked = response.type == 'tab';
      this.activeLinkIndex = response.tabIndex;
      if(!isTabClicked)
      {
        const newIndex = this.getNavigationTabIndex(isNextType);
        this.navigateTab(newIndex);
      }else{
        this.navigateTab(response.newIndex);
      }

    }
  }
}
tabClickhandler(event, index) {
  if(index == this.activeLinkIndex)
  return;
  this.validateService.validateComponent({tabIndex:this.activeLinkIndex, newIndex:index, type:'tab'});
}

saveOrderChanges(){
  this.navLinks.forEach((navItem, index)=>{
    navItem.isDisabled = true;
  })
  this.orderBooked = true;
  this.showNextBtn = false;
  this.showPrevBtn = false;
}

getFormattedDateTime(dateTime){
  return this.utilsService.getDisplayDateTime(dateTime);
}

}
