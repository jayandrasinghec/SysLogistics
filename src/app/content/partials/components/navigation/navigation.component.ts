import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation, HostListener,
  ViewChild, EventEmitter} from '@angular/core';
import { Element } from '@angular/compiler';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, NavigationEnd } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';




@Component({
 selector: 'app-navigation',
 styleUrls: ['navigation.component.scss'],
 templateUrl: 'navigation.component.html',
 encapsulation: ViewEncapsulation.None
})
export class NavigationComponent implements OnInit {

 @Input() index: number ;
 @Input() total: number ;
 @Input() showPrev: boolean ;
 @Input() showNext: boolean ;
 @Input() orderBooked: boolean;
 @Input() showEditBtn: boolean ;
 @Input() isEdit?: boolean;
 @Input() showSaveOrder?: boolean;
 @Output() clickEvent: EventEmitter<any> = new EventEmitter();

 @Input() confirmDialogMsg: string;
 @Input() orderSerchMode: boolean;

 orderModel:any;
 consolidation_type :string;
 orderStatus: boolean = false;
 routerSubscription: any;
 constructor(private localStorageService : LocalStorageService, private router: Router, private dialogService : DialogService) {
   this.routerSubscription = this.router.events.subscribe((event) => {this.setupButtons(event); });
 }
 ngOnInit() {

 }
 setupButtons(event) {
  if (event instanceof NavigationEnd ) {
    this.localStorageService.getData(`${ApplicationService.instance.order_id}:order_status_consolidated`).subscribe((result) => {
      if (result) {
             this.orderModel = JSON.parse(result);
             if (this.orderModel && this.orderModel.hasOwnProperty('consolidation_Type')) {
                this.consolidation_type = this.orderModel.consolidation_Type;
             }
             if (this.orderModel.no_Move && this.orderModel.no_Move_Code === 'CL' || this.orderModel.no_Move_Code === 'NM') {
                this.orderStatus = true;
             } else {
              this.orderStatus = false;
             }
      }
    });
  }
 }
 cancelBtnClickHandler(event) {
   const dialogRef = this.dialogService.showConfirmationPopup(Messages.CANCEL_BOOKING_TITLE,Messages.CONFIRM_CANCEL_BOOKING);
   
   dialogRef.afterClosed().subscribe(result => {
     if (result && result.clickedOkay) {
       this.localStorageService.clearBookingData(ApplicationService.instance.booking_id)
       this.router.navigateByUrl('dashboard');
     }
   });
 }
 prevBtnClickHandler(event) {
   this.clickEvent.emit({type: 'prev'});
 }
 nextBtnClickHandler(event) {
   this.clickEvent.emit({type: 'next'});
 }

 saveOrderBtnClickHandler(event){
   this.clickEvent.emit({type: 'save'});
 }

 bookNewOrderBtnClickHandler(event){
  let bookingId = ApplicationService.instance.booking_id
  this.localStorageService.clearBookingData(bookingId);
  this.router.navigateByUrl('dashboard');

   //navigate to dashboard
 }

 printPreviewBtnClickHandler(event){

 }
 editBtnClickHandler(event){
   this.showEditBtn = false ;
   const url:any = this.router.url.replace('view-booking','edit-booking');
   this.router.navigateByUrl(url);
   this.clickEvent.emit({type: 'edit'});
 }
 closeFormBtnClickHandler(event){
  const dialogRef = this.dialogService.showConfirmationPopup(Messages.CLOSE_TITLE,Messages.CONFIRM_CLOSE_FORM);

  dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
      /*------Check if it redirect from operationModule then go back to operation otherwise goto dashboard--------*/
      const navToOperation:any = this.localStorageService.getDataByOrderId('navigateUrlToOperation');
      if(navToOperation && navToOperation.value  &&navToOperation.value.length>0){
        this.router.navigateByUrl(navToOperation.value);
      } else{
         this.localStorageService.clearBookingData(ApplicationService.instance.booking_id)
         this.router.navigateByUrl('dashboard');
      }
     }
  });
 }


 /*--------------------*/
 orderHistoryBtnHandler($event){
  this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
  const url = `order/orderhistory/${this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`)}`;
  this.clickEvent.emit({type: 'orderhistory', path: url});
 /// this.router.navigateByUrl(url);
 }
 consolidateBtnHandler($event){
  this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
  const url = `order/consolidateorder/${this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`)}`;
  this.clickEvent.emit({type: 'consolidateorder', path: url});
 // this.router.navigateByUrl(url);
 }
 statusBtnHandler($event){
  this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
  const url = `order/nomovestatus/${this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`)}`;
  this.clickEvent.emit({type: 'nomovestatus', path: url});
 // this.router.navigateByUrl(url);
 }
 ntsBtnHandler($event){
  this.localStorageService.saveData(`${ApplicationService.instance.order_id}:navigateUrl`, this.router.url);
  const url = `order/ntscharges/${this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`)}`;
  this.clickEvent.emit({type: 'ntscharges', path: url});
 // this.router.navigateByUrl(url);
 }
}
