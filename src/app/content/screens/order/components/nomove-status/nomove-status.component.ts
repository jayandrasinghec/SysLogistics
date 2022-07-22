import { Component, OnInit, SimpleChanges, OnChanges, ViewChildren, QueryList, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NoMoveStatusService } from 'src/app/services/noMoveStatus.service';
import { NoMoveStatus } from 'src/app/core/models/nomovestatus.model';
import { ApplicationService } from 'src/app/services/application.service';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { DropdownGridComponent } from 'src/app/content/partials/components/dropdown-grid/dropdown-grid.component';
import { LoaderService } from 'src/app/services/loader.service';
import { OrderSearchService } from 'src/app/services/order-search.service';

@Component({
  selector: 'app-nomove-status',
  templateUrl: './nomove-status.component.html',
  styleUrls: ['./nomove-status.component.scss']
})
export class NomoveStatusComponent implements OnInit {

  @ViewChildren(DropdownGridComponent) dropDownComponents: QueryList<DropdownGridComponent>;

  previousUrl: string;
  model: NoMoveStatus;
  authService: any;
  booking_ID: any;
  userName: any;
  statusCodes: any[];
  statusCodesHeaders: any[] = [["Code", "code"], ["Description", "description"]];
  noMoveStatusData: any[];
  noMoveSelectedStatus: any = '';
  noMoveData: any[] = [];
  ddReset: boolean = false;
  isEditMode: boolean = true;
  selectedIndex: any;
  orderId: any = '';
  isFormValid:boolean = true;
  txtAreaValid:boolean = true;
  txtAddButton: string = 'Add';

  constructor(private localStorageService: LocalStorageService,
              private cd: ChangeDetectorRef,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private noMoveStatusService: NoMoveStatusService,
              private utilsService: UtilsService,
              private orderSerchService: OrderSearchService) {
    ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('id')||activatedRoute.snapshot.paramMap.get('orderid');
    this.booking_ID = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_booking_id`);
    this.model = new NoMoveStatus();
   // this.model.order_ID = activatedRoute.snapshot.paramMap.get('id') ||  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`);
    this.orderId = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`)|| ApplicationService.instance.order_id;
    this.model.order_ID = this.orderId;
    ApplicationService.instance.booking_id = this.booking_ID;
    this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.authService = AuthService.getInstance();
    if (this.authService.hasToken) {
      this.fetchDataLoad();
      this.userName = this.authService.userName;
    } else {
      this.router.navigateByUrl("login");
    }
  }

  ngOnInit() {
    LoaderService.instance.show();
  }

  fetchDataLoad() {
    if (this.orderId && this.orderId !== 0) {
      this.noMoveStatusService.getNoMoves(this.orderId).subscribe((result) => {
        LoaderService.instance.close();
        if (!result.error) {
          this.noMoveData = result;
          this.getStatusCodes();
        }

      });
    }
  }

  getStatusCodes() {
    this.noMoveStatusService.getStatusCodes().subscribe((result) => {
      if(result){
        this.statusCodes = result.sort(x => x.code);
        this.bindStatusCodes();
      }
    });
  }

  bindStatusCodes() {
    if (this.statusCodes.length === 1) {
      this.noMoveSelectedStatus = this.statusCodes[0][this.statusCodesHeaders[1][1]];
      this.model.no_Move_Code = this.statusCodes[0][this.statusCodesHeaders[0][1]];
    }
    if (this.model.no_Move_Code && this.statusCodes.length > 0) {
      this.noMoveSelectedStatus = this.statusCodes.find(x => x.code === this.model.no_Move_Code).description;
    }
  }

  closeBtnClickHandler(event) {
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.router.navigateByUrl(this.previousUrl);
  }

  statusCodeSelecthandler(event, key) {
    this.model.no_Move_Code = event[key];
    this.ddReset = false;
  }

  addBtnClickHandler(event) {
    if (!this.validateIPElements()) {
      return ;
    }
    if (this.model.no_Move_Code) {
      this.model.created_by = this.authService.userId;
      this.model.order_ID = this.orderId;
      if (this.model.statusCode === 'I') {
        Object.assign(this.noMoveData[this.selectedIndex], this.model);
      }
      else {
        this.model.no_Move_ID === undefined || this.model.no_Move_ID === null ? this.model.statusCode = 'I' : this.model.statusCode = null;
        this.noMoveData.push(this.model);
      }

      this.model = new NoMoveStatus();
      this.model.order_ID = this.orderId;
      this.noMoveSelectedStatus = '';
      this.txtAreaValid = true;
      this.ddReset = true;
      this.txtAddButton = 'Add';
      this.cd.detectChanges();

    }

  }

  editClickHandler(event, row, index) {
    if (row.statusCode && row.statusCode === 'I') {
      this.selectedIndex = index;
      Object.assign(this.model, row);
      this.txtAddButton = 'Update';
      this.noMoveSelectedStatus = this.statusCodes.find(s => s.code === this.model.no_Move_Code).description;
    }

  }

  deleteClickHandler(event, row, index) {
    if (row.statusCode && row.statusCode === 'I') {
      this.noMoveData.splice(index, 1);
      this.model = new NoMoveStatus();
      this.model.order_ID = this.orderId;
      this.noMoveSelectedStatus = '';
      this.txtAddButton = 'Add';
      this.ddReset = true;
      this.cd.detectChanges();
    }
  }

  getDate(row) {
    return this.utilsService.getDisplayDate(row.created_date);
  }

  getTime(row) {
    return this.utilsService.getDisplayTime(row.created_date);
  }

  saveBtnClickHandler(event) {
    LoaderService.instance.show();
    this.noMoveStatusService.createNoMoves(this.orderId, this.noMoveData).subscribe(response => {
      LoaderService.instance.close();
      if (response.error) {
        alert('Error - order/${orderId}/nomovenotes');
        return;
      }
      if (response) {
        this.orderSerchService.getOrderData(this.orderId).subscribe((result: any) => {
          if (result) {
            this.localStorageService.saveData(`${result.booking_ID}:bookingOrder`, JSON.stringify(result));
            this.localStorageService.saveData(`${result.order_ID}:order`, JSON.stringify(result));
           
            this.orderSerchService.getOrderStatus(this.orderId).subscribe((resultOrderStatus: any) => {
                  this.localStorageService.saveData(`${this.orderId}:order_status_consolidated`  , JSON.stringify(resultOrderStatus));
                  this.txtAddButton = 'Add';
                  this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
                  this.router.navigateByUrl(this.previousUrl);  
            });         
       
          }
        });
      }
    });
  }

  commentChangehandler(event){
    this.txtAreaValid = true;
    this.model.comment = event;
  }

  validateIPElements() {
    this.isFormValid = true;
    if (this.model &&  this.model.comment === undefined || this.model.comment === '') {
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
    return this.isFormValid;
  }


}
