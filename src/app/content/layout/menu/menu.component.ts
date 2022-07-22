import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import {OrderSearchService} from '../../../services/order-search.service';
import {ApplicationService} from '../../../services/application.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { forkJoin } from 'rxjs';
import { BusinessRulesService } from 'src/app/services/business-rules.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  isSideBarActive: boolean = false; 
  @Output() clickEvent: EventEmitter<any> = new EventEmitter();

  constructor(private router : Router,
              private localStorageService: LocalStorageService,
              private orderSerchService: OrderSearchService,
              private dialogService : DialogService,
              private activatedRoute: ActivatedRoute,
              private rulesService: BusinessRulesService) {
              // const orderId: string = activatedRoute.snapshot.paramMap.get('orderId');
              // this.searchOrder(orderId);
             }

  ngOnInit() {
  }
  
  togglesideBar() {
      this.isSideBarActive = !this.isSideBarActive;
  } 

  displayHandler(event, type){
    this.clickEvent.emit({display : type })
  }

  signoutClickHandler(event)
  {
    const dialogRef = this.dialogService.showConfirmationPopup(Messages.SIGNOUT_TITLE,Messages.CONFIRM_SIGNOUT);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.clickedOkay) {
        this.localStorageService.clearBookingData(ApplicationService.instance.booking_id);
        // this.localStorageService.clear('order')
        // this.localStorageService.clear('view_booking_id')
        // this.localStorageService.clear('view_order_id')
        // this.localStorageService.clear('navigateUrl')
        this.localStorageService.clearAll();
        this.router.navigateByUrl('login');
      }
    });
  }
   searchOrderhandler(event) {
      if (!event.target.value || event.target.value === '') { return ; }
      const orderId: any = event.target.value ;
      if (this.isOnOrderPage()) { // IF user in  Fresh oreder or edit Order then this popup will show
            const dialogRef = this.dialogService.showConfirmationPopup(Messages.SEARCH_ORDER_TITLE,Messages.CONFIRM_EXIT_BOOKING);
            
            dialogRef.afterClosed().subscribe(result => {
              if (result && result.clickedOkay) {
                this.serchOrder(orderId);
              }
            });
      } else {
        this. serchOrder(orderId);
        this.localStorageService.clear('order_status');
      }
   }
   /* CheckOrderStatus() { // CHECKING FRESH ORDER or EDIT ORDER
      const status: string =   this.localStorageService.getItem(`order_status:${ApplicationService.instance.order_id}`);
      return (status === 'FRESH_ORDER' || status === 'EDIT_ORDER'|| status === 'VIEW_ORDER') ? true : false ;
    }*/
    isOnOrderPage() {
      const url: string = this.router.url;
      const urlArr: Array<any> = ['/booking/', '/view-booking/', '/edit-booking/'];
      for (let item of urlArr) {
        if (url.indexOf(item) !== -1) {
          return true;
        }
      }
      return false;
    }

    serchOrder(orderId: any) {
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:order`);
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:consolidatedOrders`);
      LoaderService.instance.show();

      forkJoin(
        [this.orderSerchService.getOrderData(orderId), 
        this.orderSerchService.getOrderStatus(orderId),
        this.rulesService.getRules(orderId)]
        ).subscribe((response:any)=> {
          LoaderService.instance.close();
          if (response && !response[2].error) {
              this.localStorageService.saveData(`${orderId}:order_status_consolidated`  , JSON.stringify(response[1]));
              this.orderSerchService.searchresult.next(response[0]);
              this.rulesService.initilize(response[2]);
          }
          else{
            this.dialogService.showInfoPopup(Messages.SEARCH_ORDER_TITLE,Messages.NO_RECORDS);
          }
      },
      (error)=> {
        console.error(error.message);
      });
    }
}
