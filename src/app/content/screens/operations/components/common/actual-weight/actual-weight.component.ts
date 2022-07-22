import { Component, OnInit, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import AuthService from 'src/app/services/auth.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import { ApplicationService } from 'src/app/services/application.service';
import { InputTextComponent } from 'src/app/content/partials/components/inputtext/inputtext.component';
import { OperationsService } from 'src/app/services/operation.service';
import { WeightPieces } from 'src/app/core/models/weight-pieces.model';
import { BookingService } from 'src/app/services/booking.service';
import * as _ from 'lodash';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
import { SectionMapping } from 'src/app/common/section-mapping';
import { takeUntil } from 'rxjs/operators';
import {Subject } from 'rxjs';
@Component({
  selector: 'app-actual-weight',
  templateUrl: './actual-weight.component.html',
  styleUrls: ['./actual-weight.component.scss']
})
export class ActualWeightComponent implements OnInit {

  authService:any;
  orderModel:BookingOrder = new BookingOrder();
  previousUrl:string;
  isEditable:boolean = false;
  shouldSectionDisabled: boolean;
  model : WeightPieces;
  private moduleName:any;
  private orderModelToCompare: any;
  private destroy$ = new Subject();
  @Output() modelChange: EventEmitter <any> = new EventEmitter();
  @ViewChildren(InputTextComponent) inputTextComponent: QueryList<InputTextComponent>;
  private order_ID:any;
  constructor(
    private router:Router,
    private localStorageService:LocalStorageService,
    private operationService: OperationsService,
    private route: ActivatedRoute,
    private dialogService : DialogService,
    private activatedRoute:ActivatedRoute,
    private bookingService: BookingService,
    private utilsService: UtilsService,
    private rulesService: BusinessRulesService) {
    
    this.model = new WeightPieces();
    this.authService = AuthService.getInstance();
    if(this.authService.hasToken){
    /*  this.localStorageService.getData(`${ApplicationService.instance.order_id}:operation_order`).subscribe((result) =>
      {
        if(result){
          this.orderModelToCompare = Object.assign({}, JSON.parse(result));
          this.orderModel = JSON.parse(result);
        }
        else {
          this.route.params.subscribe((params: any) => {
            this.bookingService.getOrderData(params.orderid)
            .pipe()
            .subscribe((response: any)=> {
              this.orderModelToCompare = Object.assign({}, response);
              this.orderModel = response;
            });
          });
        }
      })
      this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`)*/
    }else{
      this.router.navigateByUrl("login");
    }
   }

  ngOnInit() {  
    this.order_ID = this.activatedRoute.snapshot.paramMap.get('orderid') ;
    this.previousUrl = this.localStorageService.getItem(`${this.order_ID}:navigateUrl`)
    this.getOrderData();
    this.configModuleName();
    this.shouldSectionDisabled = this.rulesService.shouldSectionDisabled(SectionMapping.PICESS_WEIGHT);
  }

  private configModuleName(){
     const tabID = this.activatedRoute.snapshot.paramMap.get('tabId');
     this.moduleName = this.utilsService.getModuleNameFromTabID(tabID);
  }

  private getOrderData(){
     this.bookingService.getOrderData(this.order_ID)
            .pipe()
            .subscribe((response: any)=> {
              this.orderModelToCompare = Object.assign({}, response);
              this.orderModel = response;
            });
  }

  actualaWeightLBSChangehandler(event){
    if (this.orderModel) {
      this.orderModel.weight_Actual_LB = Number(event);
      this.model.actualWeightLB = this.orderModel.weight_Actual_LB;
      this.emitEvent();
    }
  }

  actualaWeightKGChangehandler(event){
    if (this.orderModel) {
      this.orderModel.weight_Actual_KG = Number(event);
    }
  }

  focusOutHandler(event){
    if (this.orderModel) {
      this.orderModel.weight_Actual_KG = (Number(event) / 2.20462).toFixed(2);
    }
    // this.actualaWeightKG
  
  }

  actualPiecesChangehandler(event){
    if (this.orderModel) {
      this.orderModel.pieces = Number(event);
      this.model.pieces = this.orderModel.pieces;
      this.emitEvent();
    }
  }

  emitEvent() {
    this.modelChange.emit(this.orderModel);
  }

  editClickHandler(event){
    this.isEditable = true;
  }

  saveClickHandler(event){
    // this.isEditable = false;
    if (!this.validateIPElements()) {
      return ;
    }

    this.model.order_ID = this.orderModel.order_ID;
    this.model.module = this.moduleName;     
    this.operationService.updateActualWeightAndPieces(this.model).subscribe((response: any) => {
      if(response.error){
        alert('Error - update customer/order/weight')
        return false;
      }
      /*---------Changes for Reflecting the pieces change in order Booking Page -----------*/
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:order`,JSON.stringify(this.orderModel));
      this.localStorageService.saveData(`${this.orderModel.booking_ID}:bookingOrder`, JSON.stringify(this.orderModel))
      /*--------------------*/
      this.localStorageService.saveData(`${ApplicationService.instance.order_id}:operation_order`,JSON.stringify(this.orderModel));
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
      this.rulesService.getRules(ApplicationService.instance.order_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((rules)=> {
          this.rulesService.initilize(rules);
          this.router.navigateByUrl(this.previousUrl);
        });      
    });

  }

  validateIPElements() {
    let isFormValid : boolean = true;
   if (this.inputTextComponent) {
     for (let textBox of this.inputTextComponent.toArray()) {
       if (!textBox.validateInputElement())  {
         isFormValid = false;
       }
     }
   }
   return isFormValid;
 }
  
  closeClickHandler(event){
    if(this.isDirty()) {
      this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE,Messages.SAVE_CHANGES)
      .afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
          this.saveClickHandler(event);
        }
        else {
          this.router.navigateByUrl(this.previousUrl);
        }
      });
    }
    else {
      this.router.navigateByUrl(this.previousUrl);
    }
  }

  private isDirty() {
    return !_.isEqual(this.orderModelToCompare, this.orderModel);;
  }

  ngOnDestroy(): void {
     this.destroy$.next();    
  }

}
