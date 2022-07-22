import { Component, OnInit, ViewChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BookingService } from 'src/app/services/booking.service';
import BookingOrder from 'src/app/core/models/booking-order.model';
import AuthService from 'src/app/services/auth.service';
import {LoaderService} from '../../../../../services/loader.service';
import {NTSModel} from '../../../../../core/models/nts.model';
import { DollarInputComponent } from 'src/app/content/partials/components/input-dollar/input-dollar';
import { AutopopulateInputTextComponent } from 'src/app/content/partials/components/autopopulate-inputtext/autopopulate-inputtext.component';
import { DropdownGridComponent } from 'src/app/content/partials/components/dropdown-grid/dropdown-grid.component';
import { ApplicationService } from 'src/app/services/application.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-nts-charges',
  templateUrl: './nts-charges.component.html',
  styleUrls: ['./nts-charges.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NtsChargesComponent implements OnInit {

  @ViewChildren(DollarInputComponent) dollarInputComponent: QueryList<DollarInputComponent>;
  @ViewChildren(DropdownGridComponent) dropDownComponents: QueryList<DropdownGridComponent>;
  previousUrl: string;
  orderModel: BookingOrder;
  ntsModel: NTSModel;
  authService: any;

  mainGroupHeaders: any[] = [['CODE', 'group_Main']];
  mainGroupUniqueOptions: any[] = [];
  mainGroupOptions: any[] = [];

  subGroupHeaders: any[] = [['CODE', 'group_Sub']];
  subGroupOptions: any[] = [];

  ntsData:any;
  isEditmode: boolean = false;
  selectedRowIndex: any;
  isFormValid:boolean = true;
  txtAreaValid:boolean = true;
  totalSaving: any =  0;
  ddReset:boolean;
  autoHeight:any;

  constructor(private router: Router,
              private bookingService: BookingService,
              private localStorageService: LocalStorageService,
              private activatedRoute: ActivatedRoute,
              private dialogService : DialogService
            ) {
                ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('id');
                this.orderModel = new BookingOrder();
                this.ntsModel = new NTSModel();
                this.orderModel.order_ID = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`);
                this.orderModel.booking_ID = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_booking_id`);
                this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
                this.authService = AuthService.getInstance();
                if (this.authService.hasToken) {
                  this.fetchDataLoad();
                } else {
                  this.router.navigateByUrl("login");
                }

  }

  ngOnInit() {
    LoaderService.instance.show();
  }
  closeBtnClickHandler(event){
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.router.navigateByUrl(this.previousUrl);
  }
  fetchDataLoad() {
    if (this.orderModel.order_ID) {
      this.bookingService.getNTSData(this.orderModel.order_ID).subscribe( (result: any) => {
        LoaderService.instance.close();
        this.ntsData = this.setStatusCode(result) ;
        this.updateTotalSaving();
        this.createmainGroupOptions(result);
      });
    }
  }
  setStatusCode(data: any) {
   let i = 0;
    const gridData = data.filter((d) => d.order_ID !== null && d.booking_ID !== null);
    for (let item of gridData) {
      if (item.statusCode === undefined) {
        item.statusCode = 'null';
        item.description = item.group_Description;
        item.itemIndex = i++
      }
    }
    return gridData;
  }
  createmainGroupOptions(result: any) {
    let mainArr : any = [];
    this.mainGroupUniqueOptions = result.filter((item) => {
      if (mainArr.indexOf(item.group_Main) === -1 && item.order_ID === null && item.booking_ID === null) {
         mainArr.push(item.group_Main);
         return item;
      }
    });

    this.mainGroupOptions = result.filter((item) => item.order_ID === null && item.booking_ID === null);
  }

  mainGroupTextChangehandler(event){

  }
  mainGroupSelecthandler(event, key) {
    this.ntsModel.group_Main = event.group_Main;
    // filter not returning full record.
    this.subGroupOptions = this.mainGroupOptions.filter(item =>  item.group_Main == event.group_Main );
  }
  subGroupTextChangehandler(event){

  }
  subGroupSelecthandler(event, key) {
    this.ntsModel.group_Sub = event.group_Sub;
  }
  focusOutFunction(event) {

  }
  descriptionChangehandler(event){
    this.txtAreaValid = true;
    this.ntsModel.group_Description = event;
    this.ntsModel.description = event;
  }
  charageableAMTChangehandler(event) {
    this.ntsModel.chargeable_Amount = event;
  }
  charagedAMTChangehandler(event) {
    this.ntsModel.charged_Amount = event;
  }
  addItem(event) {

      if (!this.validateIPElements()) {
        return ;
      }
      this.ntsModel.itemIndex = this.ntsData.length;
      this.ntsModel.statusCode = 'I';
      this.ntsModel.status = 1;
      this.ntsModel.order_ID = this.orderModel.order_ID ;
      this.ntsModel.booking_ID =  this.orderModel.booking_ID ;
      this.ntsModel.created_By = AuthService.getInstance().userId;
      this.ntsData.push(this.ntsModel);
      this.ntsModel = new NTSModel(); // resetting ;
      this.updateTotalSaving();
  }

  updateItem(event) {
    this.ntsModel.statusCode = (this.ntsModel.statusCode && this.ntsModel.statusCode !== 'I') ? 'U' : 'I';
    this.ntsModel.status = 1;
    this.ntsModel.order_ID = this.orderModel.order_ID ;
    this.ntsModel.booking_ID =  this.orderModel.booking_ID ;
    if(this.ntsModel.statusCode && this.ntsModel.statusCode == 'I'){
    this.ntsModel.created_By = AuthService.getInstance().userId;
    }
    else{
    this.ntsModel.modified_By = AuthService.getInstance().userId;
    }

    this.ntsData[this.selectedRowIndex] =  this.ntsModel;
    this.ntsModel = new NTSModel();
    this.isEditmode = false;
    this.updateTotalSaving();

  }
  editRow(row, index) {
    this.ntsModel = null;
    this.ntsModel = Object.assign({}, row) ;
    this.isEditmode = true;
    this.selectedRowIndex = row.itemIndex ;
  }
  deleteRow(row, index) {

    const dialogRef = this.dialogService.showConfirmationPopup(Messages.DELETE_TITLE,Messages.CONFIRM_DELETE_ROW);

    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
      if (row.statusCode && row.statusCode === 'I') {
        this.ntsData.splice(row.itemIndex , 1);
        let i = 0;
        for(let item of this.ntsData)
        {
          item.itemIndex = i++;
        }
      } else {
        row.statusCode = 'D';
        row.order_ID = this.orderModel.order_ID ;
        row.booking_ID =  this.orderModel.booking_ID ;
        row.deleted_By =  AuthService.getInstance().userId;
        row.created_By =  AuthService.getInstance().userId;
        row.status = 0;
      }
      this.updateTotalSaving();
      this.ntsModel = new NTSModel();
      }
    });
  }
  submit(event) {
      LoaderService.instance.show();
      for(let item of this.ntsData){
        delete item.itemIndex;
      }
      this.bookingService.saveNTSData(this.ntsData).subscribe((response: any) => {
        LoaderService.instance.close();
        if(response.error){
          alert('Error - shotrak/nts')
          return false;
        }
        this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
        this.router.navigateByUrl(this.previousUrl);


      });

  }
  updateTotalSaving() {
    this.totalSaving = 0;
    for (let row of this.ntsData) {
      if (row.statusCode !== 'D') {
        this.totalSaving = this.totalSaving + ( Number(row.chargeable_Amount) -  Number(row.charged_Amount));
      }
    }
  }

  totalSavingChangeHandler(event){
    console.log('totalSavingChangeHandler : ', event);
  }


  validateIPElements() {
    this.isFormValid = true;
    if (this.ntsModel &&  this.ntsModel.description === undefined) {
      this.txtAreaValid = false ;
      this.isFormValid = false ;
    }

    if (this.dropDownComponents) {
      for (let dropdown of this.dropDownComponents.toArray()) {
        if (!dropdown.validateInputElement())  {
          this.isFormValid = false;
        }
      }
    }
    if (this.dollarInputComponent){
      for (let dollarText of this.dollarInputComponent.toArray()) {
        if (!dollarText.validateInputElement()) {
          this.isFormValid = false;
        }
      }
    }
    return this.isFormValid;
  }


}
