import { Component, OnInit,  Input, ViewChildren, QueryList, OnDestroy, ViewEncapsulation } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import BookingOrder from 'src/app/core/models/booking-order.model';
import AuthService from 'src/app/services/auth.service';
import {ConsolidateModel} from '../../../../../core/models/consoloidate.model';
import {LoaderService} from '../../../../../services/loader.service';
import { BookingService } from 'src/app/services/booking.service';
import { InputTextComponent } from 'src/app/content/partials/components/inputtext/inputtext.component';
import {ExportService} from '../../.././../../services/export.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { OrderSearchService } from 'src/app/services/order-search.service';
import { ApplicationService } from 'src/app/services/application.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-consolidate-orders',
  templateUrl: './consolidate-orders.component.html',
  styleUrls: ['./consolidate-orders.component.scss']
})
export class ConsolidateOrdersComponent implements OnInit, OnDestroy {
  @ViewChildren(InputTextComponent) inputTextChildren: QueryList<InputTextComponent>;

  previousUrl: string;
  orderModel:any ;
  orderStatusModel:any;
  consolidateModel: ConsolidateModel;
  authService: any;
  orderID:any;
  masterOrderID:any;
  isEditmode:boolean = true;
  selectedRowIndex:any;
  isFormValid:boolean = true;
  txtAreaValid:boolean = true;
  isConsolidated:boolean = false;
  isMasterOrderFound: boolean= false;
  orderType:any ;
  autoHeight:any;
  strNotes: '';
  MASTER_ORDER_TYPE: string = 'M';
  CONSOLIDATED_ORDER_TYPE: string = 'C';

  consolidationOrders:any=[];
  totalOrders:any = 0 ;
  totalPieces:any = 0 ;
  totalDimWeight:any = 0 ;
  totalActulalWeight:any = 0 ;

  isDeletedAll: boolean = false;
  showupdateBtn:boolean = false;
  disableOrder:boolean = true;
  constructor(private router: Router,
              private bookingService: BookingService,
              private localStorageService: LocalStorageService,
              private exportService: ExportService,
              private utilsService: UtilsService,
              private orderSerchService: OrderSearchService,
              private activatedRoute: ActivatedRoute,
              private dialogService : DialogService) {
    console.log('Order local storage',this.localStorageService.getItem('order'));
    ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('id') || activatedRoute.snapshot.paramMap.get('orderid');

    this.consolidateModel = new ConsolidateModel();
    // this.masterOrderID = this.orderModel.order_ID;
    this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
    if(this.previousUrl.indexOf('operations') !=-1)
    {
      this.orderModel = JSON.parse(this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`)) ;
    }
    else{
      this.orderModel = JSON.parse(this.localStorageService.getItem(`${ApplicationService.instance.order_id}:order`)) ;
    }
    this.orderStatusModel = JSON.parse(this.localStorageService.getItem(`${ApplicationService.instance.order_id}:order_status_consolidated`)) ;

    this.authService = AuthService.getInstance();
    if (this.orderStatusModel && this.orderStatusModel.consolidation === true) {
        this.isConsolidated = true;
        this.fetchConsolidatedOrders();
        this.orderID = '';
    } else {
        this.orderID = this.orderModel.order_ID ;
      //  this.disableOrder = true;
    }
   }

  ngOnInit() {
    this.orderType = this.MASTER_ORDER_TYPE;
    const consOrdrs = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:consolidatedOrders`);
    this.consolidationOrders = (consOrdrs) ? JSON.parse(consOrdrs) : [];
    if (this.consolidationOrders && this.consolidationOrders.length>0){
      this.updateTotal();
      this.populateRadioGroup();
    }

  }
  ngOnDestroy() {
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:consolidatedOrders`);
  }
  createConsolidateOrder(data: any) {
      this.consolidationOrders.push(data );
  }
  fetchConsolidatedOrders() {
    LoaderService.instance.show();
    this.bookingService.getConsolidatedOrders(this.orderModel.order_ID).subscribe((result: any) => {
      console.log('fetchConsolidatedOrders result', result);
      LoaderService.instance.close();
      if (result && result.error === undefined) {
        this.localStorageService.clear(`${ApplicationService.instance.order_id}:consolidatedOrders`);
        this.populateOrders(result);
        this.updateTotal();
        this.masterOrderID = this.getMasterOrderID();
        this.orderType='';
        //this.isEditmode = false;
      }
    });

  }
  getMasterOrderID() {
    const masterRow = this.consolidationOrders.filter(item => item.master_Order_ID.toString() ==  item.consolidated_Order_ID.toString()
                                                        && item.statusCode !== 'D' );
    if (masterRow[0] && masterRow[0].master_Order_ID !== ''){
     return masterRow[0].master_Order_ID ;
    }
    return null;
  }
  populateRadioGroup(){
    this.isMasterOrderFound = this.checkForMasterOrder();
    this.orderType = (this.isMasterOrderFound) ? this.CONSOLIDATED_ORDER_TYPE : this.MASTER_ORDER_TYPE;
  }
  populateOrders(data:any) {
    this.consolidationOrders=[];
    for (let item of data) {
      const model = new ConsolidateModel();
      model.master_Order_ID = item.master_Order_ID;
      model.consolidated_Order_ID = item.consolidated_Order_ID;
      model.notes = item.notes;
      model.created_by = item.created_by;
      model.dest_Air_Code = item.orderDetail.dest_Air_Code;
      model.origin_Air_Code = item.orderDetail.origin_Air_Code;
      model.pieces = item.orderDetail.pieces;
      model.pieces_Description = item.orderDetail.pieces_Description;
      model.weight_Actual_KG = item.orderDetail.weight_Actual_KG;
      model.weight_Actual_LB = item.orderDetail.weight_Actual_LB;
      model.weight_Dimensional_KG = item.orderDetail.weight_Dimensional_KG;
      model.weight_Dimensional_LB = item.orderDetail.weight_Dimensional_LB;
      this.consolidationOrders.push(model);
    }

  }
  fetchOrders(){
    LoaderService.instance.show();
    if (this.orderID) {
      this.bookingService.getOrderData(this.orderID).subscribe((result: any) => {
        LoaderService.instance.close();
        console.log('result ',result);
        if (result && result.error === true || result == null) {
          console.log('No records found');
          this.showPopup({title:'Result',message :'No result found'});
          return false;
        }
        this.masterOrderID =  this.getMasterOrderID();
        console.log('fetchOrders this.masterOrderID  ',this.masterOrderID);
        if (this.orderType === this.MASTER_ORDER_TYPE) {
          this.consolidateModel.consolidated_Order_ID = this.orderID;
          this.consolidateModel.master_Order_ID = (this.masterOrderID != null) ? this.masterOrderID : this.orderID;
          this.isMasterOrderFound = true ;
          this.orderType = this.CONSOLIDATED_ORDER_TYPE;
        } else {
        this.consolidateModel.consolidated_Order_ID = this.orderID;
        this.consolidateModel.master_Order_ID = '';
        }
        this.consolidateModel.active_Flag = true;
        this.consolidateModel.statusCode = 'I';
        this.consolidateModel.created_by = AuthService.getInstance().userId;
        this.consolidateModel.origin_Air_Code = result.origin_Air_Code ;
        this.consolidateModel.dest_Air_Code = result.dest_Air_Code ;
        this.consolidateModel.pieces = result.pieces ;
        this.consolidateModel.weight_Dimensional_LB = result.weight_Dimensional_LB ;
        this.consolidateModel.weight_Actual_LB = result.weight_Actual_LB ;
        this.consolidateModel.pieces_Description = result.pieces_Description ;
        this.consolidateModel.notes = this.strNotes;
        this.strNotes = '';
        this.consolidationOrders.push( this.consolidateModel);
        this.localStorageService.saveData(`${ApplicationService.instance.order_id}:consolidatedOrders`,JSON.stringify(this.consolidationOrders));
        this.updateTotal();
        this.reset();
        console.log('this.consolidationOrders ',this.consolidationOrders);
      });
    }
  }
  updateTotal() {
      this.totalActulalWeight = 0;
      this.totalDimWeight = 0;
      this.totalOrders = 0;
      this.totalPieces = 0;
      for (let item of this.consolidationOrders) {

          this.totalActulalWeight = this.totalActulalWeight + item.weight_Actual_LB ;
          this.totalDimWeight = this.totalDimWeight + item.weight_Dimensional_LB ;
          this.totalOrders =   this.totalOrders + 1 ;
          this.totalPieces =  this.totalPieces + item.pieces ;
          if (item.statusCode && item.statusCode === 'D') {
            this.totalActulalWeight = this.totalActulalWeight - item.weight_Actual_LB ;
            this.totalDimWeight = this.totalDimWeight - item.weight_Dimensional_LB ;
            this.totalOrders =   this.totalOrders - 1 ;
            this.totalPieces =  this.totalPieces - item.pieces ;
          }
      }
  }
  checkForMasterOrder() {
   if (this.isDeletedAll) { return true; }
   const isFound = this.consolidationOrders.filter(item => item.master_Order_ID &&
                                                   item.consolidated_Order_ID &&
                                                   item.master_Order_ID.toString() ===  item.consolidated_Order_ID.toString() &&
                                                   item.statusCode !== 'D'   );
   if (isFound && isFound.length > 0 ) {
    return true;
   }
   return false;

  }
  isMasterRow(row) {
    return row.master_Order_ID.toString() === row.consolidated_Order_ID.toString();
  }
  showPopup(popupdata:any){
    const dialogRef = this.dialogService.showInfoPopup(popupdata.title,popupdata.message);

    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
      }
    });
  }


  closeBtnClickHandler(event){
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:consolidatedOrders`);
    this.router.navigateByUrl(this.previousUrl);
  }
  orderIdChangehandler(event) {
    this.orderID = event ;
  }
  notesChangehandler(event) {
     console.log('event  ', event);
     this.strNotes = event;
  }
  focusOutFunction(event) {

  }

  edit(row , index) {
    this.consolidateModel = null;
    this.consolidateModel = Object.assign({}, row) ;
    this.orderID = this.consolidateModel.consolidated_Order_ID;
    this.strNotes = this.consolidateModel.notes;
    this.isEditmode = true;
    this.disableOrder = false;
    this.showupdateBtn = true;
    this.orderType = this.isMasterRow(row)? this.MASTER_ORDER_TYPE : this.CONSOLIDATED_ORDER_TYPE;
    this.selectedRowIndex = index ;
  }


  deleteRow(row , index) {
    const isMasterOrder: boolean = this.isMasterRow(row) ;
    const mesage = (isMasterOrder) ? Messages.CONFIRM_DELETE_MASTER_ROW:Messages.CONFIRM_DELETE_ROW;
    const dialogRef = this.dialogService.showConfirmationPopup(Messages.DELETE_TITLE,mesage);
    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
        this.deleteRecords(row,isMasterOrder);
        this.isDeletedAll = true;

      }
    });
  }
  deleteRecords(row: any , isMasterOrder: boolean) {
        let clonedConsolidateionOrders = this.consolidationOrders;
        if (isMasterOrder) {
            if(this.consolidationOrders.length == this.consolidationOrders.filter(item => item.statusCode == 'I').length)
            {
              this.consolidationOrders = [];
            }else{
              for (let item of this.consolidationOrders) {
                  item.statusCode = 'D';
                }
            }
            this.isMasterOrderFound = false;
            this.orderType = this.MASTER_ORDER_TYPE;
            this.isConsolidated = false;
        } else {
          for (let item of this.consolidationOrders) {
              if (item.consolidated_Order_ID == row.consolidated_Order_ID)
              {
                if(item.statusCode === 'I') {
                const index =  this.consolidationOrders.indexOf(item);
                this.consolidationOrders.splice(index, 1);
              } else {
                item.statusCode = 'D';
              }
            }
          }
        }
        this.updateTotal();
        this.reset();
        this.localStorageService.saveData(`${ApplicationService.instance.order_id}:consolidatedOrders`,JSON.stringify(this.consolidationOrders));
  }
  isOrderAdded() { //Checking order is already present related with order type
      const itemFound = this.consolidationOrders.filter((item) => {
      if ( item.master_Order_ID && item.master_Order_ID.toString() === this.orderID.toString()  ) {
        return item;
      }
      if ( item.consolidated_Order_ID && item.consolidated_Order_ID.toString() === this.orderID.toString() ) {
        return item;
      }
      });
      if (itemFound && itemFound.length > 0) {
       return itemFound;
      }
      return null;
  }


  addOrder(event) {
    if (!this.validateIPElements()) {
      return ;
    }
    if (this.isOrderAdded() !== null) { // Check order id is already presnt in background Array
        const item = this.consolidationOrders.filter(item => item.consolidated_Order_ID && item.consolidated_Order_ID.toString() === this.orderID.toString());
        if (item.length == 1 && item[0].statusCode === 'D') { // Check order id is already presnt in background Array as Deleted status
               this.fetchOrders();
               return false;
        } else {
          this.showPopup({title: 'Result', message : 'Order Id already added'});
        }
        this.localStorageService.saveData(`${ApplicationService.instance.order_id}:consolidatedOrders`, JSON.stringify(this.consolidationOrders));
        this.updateTotal();
        this.reset();
        return false;
    }
    console.log('this.masterOrderID   ', this.masterOrderID );
    if (this.orderModel && this.orderID === this.orderModel.order_ID) {
          if (this.orderType === this.MASTER_ORDER_TYPE) {
                this.consolidateModel.consolidated_Order_ID = this.orderID;
                this.consolidateModel.master_Order_ID = this.orderID;
                this.isMasterOrderFound = true ;
                this.orderType =  this.CONSOLIDATED_ORDER_TYPE;
          } else {
                this.consolidateModel.consolidated_Order_ID = this.orderID;
                this.consolidateModel.master_Order_ID = '';
          }
          this.consolidateModel.active_Flag = true;
          this.consolidateModel.statusCode ='I';
          this.consolidateModel.created_by = AuthService.getInstance().userId;
          this.consolidateModel.origin_Air_Code = this.orderModel.origin_Air_Code ;
          this.consolidateModel.dest_Air_Code = this.orderModel.dest_Air_Code ;
          this.consolidateModel.pieces = this.orderModel.pieces ;
          this.consolidateModel.weight_Dimensional_LB = this.orderModel.weight_Dimensional_LB ;
          this.consolidateModel.weight_Actual_LB = this.orderModel.weight_Actual_LB ;
          this.consolidateModel.pieces_Description = this.orderModel.pieces_Description ;
          this.consolidateModel.notes = this.strNotes;
          console.log(' this.consolidateModel ', this.consolidateModel);
          this.consolidationOrders.push(this.consolidateModel);
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:consolidatedOrders`, JSON.stringify(this.consolidationOrders));
          this.updateTotal();
          this.reset();
    } else {
      LoaderService.instance.show();
      this.bookingService.getConsolidatedOrders(this.orderID).subscribe((result: any) => {
        console.log('getConsolidatedOrders result', result);
        LoaderService.instance.close();
        if (result && result.length > 0) {
          this.showPopup({title: 'Result', message : `Order id ${this.orderID} is already part of other group`});
          this.reset();

        } else {
          this.fetchOrders();
        }
      });
    }
  }
  updateOrder(event) {
    this.masterOrderID = this.getMasterOrderID();
    console.log('this.masterOrderID  ',this.masterOrderID);
    let updateItem = this.consolidationOrders.filter(item => item.consolidated_Order_ID == this.orderID && item.statusCode != 'D')[0];
    updateItem.statusCode = ( this.consolidateModel.statusCode !== 'I' ) ? 'U' : 'I';
    updateItem.notes = this.strNotes ;
    if (this.orderType === this.MASTER_ORDER_TYPE) {
      updateItem.consolidated_Order_ID = this.orderID;
      updateItem.master_Order_ID = this.orderID;
      this.isMasterOrderFound = true ;
      this.orderType = this.CONSOLIDATED_ORDER_TYPE;
    } else {
      updateItem.consolidated_Order_ID = this.orderID;
      updateItem.master_Order_ID = (this.masterOrderID != null) ? this.masterOrderID : this.orderID ;
    }
    this.localStorageService.saveData(`${ApplicationService.instance.order_id}:consolidatedOrders`, JSON.stringify(this.consolidationOrders));
    this.isEditmode = true;
    this.showupdateBtn = false;
    this.disableOrder = true;
    this.updateTotal();
    this.reset();

  }
  submit(event) {
      console.log('this.orderType  ', this.orderType);
      if (!this.checkForMasterOrder()) {
        this.showPopup({title: 'Result',message : 'Master order not added'});
        return false;
      }
      const clonedOrders  = JSON.parse(JSON.stringify( this.consolidationOrders));
      this.masterOrderID =  this.getMasterOrderID();
      for (let item of clonedOrders) {
          if (item.master_Order_ID === '') {
            item.master_Order_ID = this.masterOrderID;
          }
          delete item.origin_Air_Code;
          delete item.dest_Air_Code;
          delete item.pieces;
          delete item.weight_Dimensional_LB;
          delete item.weight_Actual_LB;
          delete item.pieces_Description;
          delete item.weight_Actual_KG;
          delete item.weight_Dimensional_KG;
      }

      this.bookingService.saveConsolidatedOrders(clonedOrders).subscribe((result: any) => {
        if (result && result.error === true) {
          this.showPopup({title: 'Result', message : 'Failed to save the Orders'});
          return false;
        }
        if (result) {
          this.orderSerchService.getOrderData(this.orderModel.order_ID).subscribe((response: any) => {
            if (response) {
              this.localStorageService.saveData(`${response.booking_ID}:bookingOrder`, JSON.stringify(response));
              this.localStorageService.saveData(`${ApplicationService.instance.order_id}:order`, JSON.stringify(response));
              this.localStorageService.clear(`${ApplicationService.instance.order_id}:consolidatedOrders`);
              
              this.orderSerchService.getOrderStatus(this.orderModel.order_ID).subscribe((resultOrderStatus: any) => {
                  this.localStorageService.saveData(`${this.orderModel.order_ID}:order_status_consolidated`  , JSON.stringify(resultOrderStatus));
                   this.router.navigateByUrl(this.previousUrl);   
                });           
            
             }
          });
        }
      });

  }
  exportBtnClickHandler(event) {
    let clonedOrders  = JSON.parse(JSON.stringify(this.consolidationOrders));
    clonedOrders  = clonedOrders.filter(item => item.statusCode !== 'D')

      const masterOrderId = this.getMasterOrderID();
      let exportConsolidations : any = [];
      for (let item of clonedOrders) {
        const model = new ConsolidateModel();
        model.master_Order_ID = masterOrderId
        model.consolidated_Order_ID = item.consolidated_Order_ID;
        model.origin_Air_Code = item.origin_Air_Code;
        model.dest_Air_Code = item.dest_Air_Code;
        model.pieces = item.pieces;
        model.weight_Dimensional_LB = item.weight_Dimensional_LB;
        model.weight_Actual_LB = item.weight_Actual_LB;
        model.pieces_Description = item.pieces_Description;
        model.notes = item.notes;
        exportConsolidations.push(model);
      }

    this.exportService.exportExcel(exportConsolidations , `consolidatedOrders_${this.utilsService.getCurrentDate_MMDDYYYY("-")}`);
  }

  reset() {
    this.consolidateModel =  new ConsolidateModel(); // resetting
    this.strNotes = '';
    this.orderID = '';
  }

  validateIPElements() {
    this.isFormValid = true;
    if (this.strNotes === undefined || this.strNotes === '') {
      this.txtAreaValid = false ;
      this.isFormValid = false ;
    }
    if (this.inputTextChildren) {
      for (let inputText of this.inputTextChildren.toArray()) {
        if (!inputText.validateInputElement()) {
          this.isFormValid = false ;
        }
      }
    }
    return this.isFormValid;
  }



}

