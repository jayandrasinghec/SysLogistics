import { Component, OnInit, HostListener, OnChanges, ChangeDetectorRef,ViewEncapsulation, AfterViewInit } from '@angular/core';
import {ApplicationService} from '../../../../../../services/application.service';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { OrigindestinationFreightService } from 'src/app/services/origin-destination-freight.service';
import { FreightDimension } from 'src/app/core/models/freight-dimension.model';
import AuthService from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Messages } from 'src/app/common/Messages';
import * as _ from 'lodash';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
import { SectionMapping } from 'src/app/common/section-mapping';
import { takeUntil } from 'rxjs/operators';
import {Subject } from 'rxjs';
@Component({
  selector: 'app-calculate-dimensions',
  templateUrl: './calculate-dimensions.component.html',
  styleUrls: ['./calculate-dimensions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalculateDimensionsComponent implements OnInit, OnChanges, AfterViewInit {
  private regex = /[^0-9]/gi;
  //arrTableRows: any[] = [{pcs: null, length: null, width: null, height: null, isEditable: true}]; //initially 1 row only wil present
  arrTableRows: any[] = new Array();// = [{pcs: null, length: null, width: null, height: null, isEditable: true}]; //initially 1 row only wil present
  private compareArr: any[] = new Array();
  totalPieces: number = 0;
  totalDimInLBS:any = 0;
  totalDimInKG:any = 0;
  curSelectedRow:any;
  curSelectedRowIndex:any;
  isStandardTable:boolean = true;
  freightDimensions:any[];
  freightDimension:FreightDimension;
  booking_ID:any;
  order_ID:any;
  authService:any;
  editClick:any = false;
  selectedColumnIndex:any = 0;
  originalDimensionsData: any[];
  previousUrl: string;
  appModuleName: string;
  tabID:any;
  sectionShouldDisabled: boolean;
  private destroy$ = new Subject();
  constructor(private router: Router,
              private cdr: ChangeDetectorRef,
              private activatedRoute: ActivatedRoute,
              private dialogService : DialogService,
              private odfService: OrigindestinationFreightService,
              private localStorageService: LocalStorageService,
              private rulesService: BusinessRulesService) {

    this.booking_ID = activatedRoute.snapshot.paramMap.get('id');
    this.order_ID = activatedRoute.snapshot.paramMap.get('orderid');
    ApplicationService.instance.booking_id = this.booking_ID;
    this.previousUrl = this.localStorageService.getItem(`${this.booking_ID}:navigateUrl`);
    this.authService = AuthService.getInstance();
    this.tabID = activatedRoute.snapshot.paramMap.get('tabId');
    if(this.authService.hasToken){
      this.configModuleName();
      this.fetchDataLoad();
    }
    else{
      this.router.navigateByUrl("login");
    }
  }

  configModuleName(){
    this.appModuleName = (this.previousUrl.indexOf('/pickup/') != -1)?'Pickup': (this.previousUrl.indexOf('/delivery/') != -1)?'Delivery':(this.previousUrl.indexOf('/airline/') != -1)?'Airline':'Booking';
  }

  fetchDataLoad(){
    this.freightDimensions = new Array();
    this.originalDimensionsData = new Array();
    const newRow = { pcs: null, length: null, width: null, height: null, isEditable: true, statusCode: 'I' };
    this.odfService.getCalculateDimensions(this.booking_ID).subscribe((response) => {
      if (response && response.dimensions.length > 0) {
        for(let dimension of response.dimensions)
          {
            this.freightDimensions.push(dimension);
            this.originalDimensionsData.push(dimension);
            const row = {
              pcs: dimension.pieces,
              length:dimension.length,
              width:dimension.width,
              height:dimension.height,
              dimWt:dimension.weightInLb,
              statusCode: null,
              dimensionId: dimension.dimensionId
            }
            this.arrTableRows.push(row);
            this.compareArr.push(Object.assign({}, row));
         /* this.totalPieces = this.totalPieces + Number(dimension.pieces);
          this.totalDimInLBS = (Number(this.totalDimInLBS) + Number(dimension.weightInLb)).toFixed(2);
          this.totalDimInKG = (Number(this.totalDimInLBS) / 2.20462).toFixed(2);*/
        }
        this.updateTotal();
        if (this.arrTableRows.length > 0) {
          this.arrTableRows.push(newRow);
          this.compareArr.push(newRow);
        }
      }
      else{
        this.arrTableRows.push(newRow);
        this.compareArr.push(newRow);
      }
    })
  }


  ngOnInit() {
    this.sectionShouldDisabled = this.rulesService.shouldSectionDisabled(SectionMapping.DIMENSIONS);
  }
  ngOnChanges(chages) {
   // this.addTableCellResize();
  }
  ngAfterViewInit(){
    //this.addTableCellResize();
  }

  public radioBtnChangehandler(event){
    switch (event.target.value){
        case 'standard':
          this.isStandardTable = true;
        break;
        case 'metric':
        this.isStandardTable = false;
        break;
    }
    this.cdr.detectChanges();
  }

  public PCSChangehandler(event, row) {
    // this.curSelectedRowIndex = this.arrTableRows.indexOf(row);
    // if (row.dimensionId && row.pcs !== this.freightDimensions[this.curSelectedRowIndex].pieces) {
    //   this.arrTableRows[this.curSelectedRowIndex].statusCode = 'E';
    // }
    row.pcs = Number(event);
  }
  public LengthChangehandler(event, row) {
    row.length = Number(event);
  }
  public WidthChangehandler(event, row) {
    row.width = Number(event);
  }
  public HeightChangehandler(event, row) {
    row.height = Number(event);
  }
  public focusOuthandler(event, row, columnIndex) {
    // this.editClick = false;
    this.selectedColumnIndex = columnIndex;
    this.curSelectedRowIndex = this.arrTableRows.indexOf(row);
    if (this.curSelectedRow && this.isRowFieldsValid(this.curSelectedRow) && this.selectedColumnIndex === 4)
    {
      this.curSelectedRow.isEditable = false;
    }
    if (row.dimensionId) {
      this.arrTableRows[this.curSelectedRowIndex].statusCode = null;;
      if (this.isRowFieldsModified(this.curSelectedRow)) {
        this.arrTableRows[this.curSelectedRowIndex].statusCode = 'U';
      }
    }
    this.checkAndCreateNextRow();
  }

  isRowFieldsValid(row) {
    if (row.pcs == null ||  row.pcs === '') { return false; }
    if (row.length == null ||  row.length === '') { return false; }
    if (row.width == null ||  row.width === '') { return false; }
    if (row.height == null ||  row.height === '') { return false; }
    return true;
  }

  isRowFieldsModified(row){
    if (row.pcs !== this.originalDimensionsData[this.curSelectedRowIndex].pieces) { return true; }
    if (row.length !== this.originalDimensionsData[this.curSelectedRowIndex].length) { return true; }
    if (row.width !== this.originalDimensionsData[this.curSelectedRowIndex].width) { return true; }
    if (row.height !== this.originalDimensionsData[this.curSelectedRowIndex].height) { return true; }
    return false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.checkAndCreateNextRow();
    }
  }
  @HostListener('document:click', ['$event.target'])
  public onClickOutside(targetElement) {
   // this.checkAndCreateNextRow();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //this.addTableCellResize();
  }
  checkAndCreateNextRow() {
    const nlen: number = this.arrTableRows.length;
    const Index: number = (this.curSelectedRow && this.curSelectedRowIndex >= 0) ? this.curSelectedRowIndex :   nlen - 1;
    const owner: any = this;
    const isRowValid: boolean = this.isRowFieldsValid(this.arrTableRows[Index]  );
    if (isRowValid) {
      //Dim Weight  - Calculated value = (pcs * (L x W x H)) / 194
      this.arrTableRows[Index].dimWt = (Number(this.arrTableRows[Index].pcs * (this.arrTableRows[Index].length * this.arrTableRows[Index].width * this.arrTableRows[Index].height))/194).toFixed(2);
      // Total Dimension (LBS) = Sum of DIM Weight column
      // Total Dimension (KG) = Total Dimension (LBS) / 2.20462
     /* this.totalPieces = this.totalPieces + Number(this.arrTableRows[Index].pcs) ;
      this.totalDimInLBS = (Number(this.totalDimInLBS) + Number(this.arrTableRows[Index].dimWt)).toFixed(2);
      this.totalDimInKG = (Number(this.totalDimInLBS) / 2.20462).toFixed(2);
    // console.log('this.arrTableRows[nlen-1] ',this.arrTableRows[Index]);
      */
      this.arrTableRows[Index].isEditable = false;
      this.editClick = false;

      this.updateTotal();
      if (Index === nlen - 1) {
        this.freightDimensions.push(this.createFreightDimension(
          Number(this.arrTableRows[Index].pcs),
          Number(this.arrTableRows[Index].length),
          Number(this.arrTableRows[Index].width),
          Number(this.arrTableRows[Index].height),
          Number(this.arrTableRows[Index].dimWt).toFixed(2),
          this.arrTableRows[Index].statusCode));
        this.arrTableRows.push({ pcs: null, length: null, width: null, height: null, isEditable: true, statusCode: 'I' });

        setTimeout(() => {
          if (this.selectedColumnIndex === 4) {
            const iptext: HTMLElement = document.getElementById(`ip1_${this.arrTableRows.length - 1}`);
            iptext.focus();
            iptext.click();
          }
          // this.editClick = false;

        }, 10);

      }
      else {
        this.freightDimensions[Index] = this.createFreightDimension(
          Number(this.arrTableRows[Index].pcs),
          Number(this.arrTableRows[Index].length),
          Number(this.arrTableRows[Index].width),
          Number(this.arrTableRows[Index].height),
          Number(this.arrTableRows[Index].dimWt).toFixed(2),
          this.arrTableRows[Index].statusCode);
        this.freightDimensions[Index].dimensionId = this.arrTableRows[Index].dimensionId;
        if (this.selectedColumnIndex === 4 && !this.editClick) {
          const iptext: HTMLElement = document.getElementById(`ip1_${this.arrTableRows.length - 1}`);
          iptext.focus();
          // iptext.click();
        }

      }
      this.cdr.detectChanges();

    }
  }

  createFreightDimension(pieces:any, length: any, width: any, height: any, dimWt: any, statusCode: any){
      this.freightDimension = new FreightDimension();
      this.freightDimension.pieces = pieces;
      this.freightDimension.length = length;
      this.freightDimension.width = width;
      this.freightDimension.height = height;
      this.freightDimension.weightInLb = dimWt;
      this.freightDimension.statusCode = statusCode;
      this.freightDimension.createdBy = AuthService.getInstance().userId;
      this.freightDimension.bookingId = this.booking_ID;
      this.freightDimension.applicationModule = this.appModuleName;
      return this.freightDimension;
  }

  rowClickHandler(event, row) {
    this.curSelectedRow = row;
    row.isEditable = true;
    this.curSelectedRowIndex = this.arrTableRows.indexOf(row);
  }

  rowEditClickHandler(event, row) {
    if (this.curSelectedRowIndex && this.curSelectedRowIndex !== this.arrTableRows.length - 1) {
      this.arrTableRows[this.curSelectedRowIndex].isEditable = false;
    }
    this.curSelectedRow = row;
    row.isEditable = true;
    this.editClick = true;
    this.curSelectedRowIndex = this.arrTableRows.indexOf(row);
    const iptext: HTMLElement = document.getElementById(`ip1_${this.curSelectedRowIndex}`);
    iptext.focus();
    this.cdr.detectChanges();
  }

  deleteHandle($event, row) {
    var selectedIndex = this.arrTableRows.indexOf(row);
    if (this.isRowFieldsValid(row)) {
      if (row.dimensionId) {
        this.arrTableRows[selectedIndex].statusCode = 'D';
        this.freightDimensions[selectedIndex].statusCode = this.arrTableRows[selectedIndex].statusCode;
      }
      else {
        this.arrTableRows.splice(selectedIndex, 1);
        this.freightDimensions.splice(selectedIndex, 1);
      }
      this.updateTotal();
      const iptext: HTMLElement = document.getElementById(`ip1_${this.arrTableRows.length - 1}`);
      iptext.focus();
    }
    else {
      const iptext: HTMLElement = document.getElementById(`ip1_${selectedIndex}`);
      iptext.focus();
    }
    this.cdr.detectChanges();
  }

  closeBtnClickHandler(event) {
    if(this.isDirty()) {
      this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE,Messages.SAVE_CHANGES)
      .afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
          this.saveBtnClickHandler(event);
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
  saveBtnClickHandler(event) {
    this.localStorageService.getData(`${this.booking_ID}:pieces`).subscribe((result) => {
      if(result){
        if (Number(result) == this.totalPieces) {
          this.saveDimensions();          
        } else {
          // alert("Total pieces must be equal to the freight pieces.")
          const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,Messages.WARNING_TOTAL_PIECES);
          return;
        }
      }else {
        let operationOrder:any = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`);
        operationOrder = (operationOrder) ? JSON.parse(operationOrder):null;
        if(operationOrder != null){
           const pieces = operationOrder.pieces;
           if (Number(pieces) == this.totalPieces) {
             this.saveDimensions();             
            } else {
              // alert("Total pieces must be equal to the freight pieces.")
              const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,Messages.WARNING_TOTAL_PIECES);
              return;
            }
        }
      }
    })
  }

  saveDimensions()
  {
    for(let item of this.freightDimensions){
       item.orderId = (this.order_ID != null ) ? this.order_ID : 0;
       item.applicationModule = this.appModuleName;
    }
    var freightDimensionData = { 'dimensions': this.freightDimensions };
    this.odfService.createDimension(freightDimensionData).subscribe( response => {
      if(response.error){
        alert('Error-  create freight/orders/dimensions');
        return;
      }
      this.localStorageService.saveData(`${this.booking_ID}:weight_Dimensional_LB`, this.totalDimInLBS);
      this.localStorageService.saveData(`${this.booking_ID}:weight_Dimensional_KG`, this.totalDimInKG);
      if(this.isOperationModule())
      {
        this.updateWeightDimension()
      }else{
        this.router.navigateByUrl(this.previousUrl);
      }      
    });
  }

  private updateWeightDimension()
  {
    const data:any = {
                      module: this.appModuleName,
                      order_ID: this.order_ID,
                      weight_Dimensional_KG: this.totalDimInKG,
                      weight_Dimensional_LB: this.totalDimInLBS
                    }
    this.odfService.updateWeightDiamension(data).subscribe((response:any)=>{
      if(response.error){
        alert('Error-  update customer/order/weightdimension');
        return;
      }
      this.rulesService.getRules(ApplicationService.instance.order_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((rules)=> {
          this.rulesService.initilize(rules);
          this.router.navigateByUrl(this.previousUrl);
        });        
    });

  }

  updateTotal() {
    this.totalPieces = 0;
    this.totalDimInLBS = 0;
    this.totalDimInKG = 0;
    this.arrTableRows.forEach(row => {
      this.totalPieces = (row.pcs !== undefined && row.statusCode !== 'D') ? (this.totalPieces + Number(row.pcs)) : this.totalPieces;
      this.totalDimInLBS = (row.dimWt !== undefined  && row.statusCode !== 'D') ? ((Number(this.totalDimInLBS) + Number(row.dimWt)).toFixed(2)) : this.totalDimInLBS ;
      this.totalDimInKG = (this.totalDimInLBS != undefined  && row.statusCode !== 'D') ? ((Number(this.totalDimInLBS) / 2.20462).toFixed(2)): this.totalDimInLBS ;
    });
  }
 /* addTableCellResize( ) {
        this.cdr.detach();
       const arrTr: any = document.querySelectorAll("tbody tr")[0].childNodes;
       const arrTh: any = document.querySelectorAll("thead tr")[0].childNodes;
       arrTr.forEach( (td , i) => {
                  arrTh[i].style.width = `${td.offsetWidth}px` ;
      });

  }*/

  private isDirty(): boolean {
    return !_.isEqual(this.compareArr, this.arrTableRows);
  }

  private isOperationModule(){
    return this.tabID != null && (this.tabID == 'PU' || this.tabID == 'DEL'|| this.tabID == 'AL') ;
  }

  ngOnDestroy(): void {
     this.destroy$.next();    
  }
}
