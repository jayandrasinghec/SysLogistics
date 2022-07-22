import { Component, OnInit, ViewEncapsulation, HostListener, ChangeDetectorRef } from '@angular/core';
import { ApplicationService } from 'src/app/services/application.service';
import { Router, ActivatedRoute } from '@angular/router';
import AuthService from 'src/app/services/auth.service';
import { OrigindestinationFreightService } from 'src/app/services/origin-destination-freight.service';
import { SpecialCharges } from 'src/app/core/models/special-charges.model';
import { UtilsService } from 'src/app/services/Utils.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
import { SectionMapping } from 'src/app/common/section-mapping';

@Component({
  selector: 'app-special-charges',
  templateUrl: './special-charges.component.html',
  styleUrls: ['./special-charges.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpecialChargesComponent implements OnInit {
  selectedIndex: number = 0;
  arrTabs: Array<any> = [];
  dataMap: Array<any> = [];
  shipperChargesData = [];
  consigneeChargesData = [];
  selectedCharges = [];
  booking_ID: any;
  authService: any;
  type:any;
  tariff_ID:any;
  zoneKey:any;
  zone:any;
  sourceKey:any;
  prevSelectedCharges = [];
  previousUrl:string;
  shouldDisableSection: boolean;

  constructor(private router: Router,
              private utilsService: UtilsService,
              private cdr: ChangeDetectorRef,
              private dialogService : DialogService,
              private activatedRoute: ActivatedRoute,
              private originDestinationService: OrigindestinationFreightService,
              private localStorageService : LocalStorageService,
              private rulesService: BusinessRulesService) {
    this.prevSelectedCharges = [];
    this.booking_ID = activatedRoute.snapshot.paramMap.get('id');
    this.type = activatedRoute.snapshot.paramMap.get('type');
    ApplicationService.instance.booking_id = this.booking_ID;
    this.previousUrl = this.localStorageService.getItem(`${this.booking_ID}:navigateUrl`);
    this.authService = AuthService.getInstance();
    this.localStorageService.getData(`${this.booking_ID}:tariff_ID`).subscribe((result) => {
      this.tariff_ID = result;
      if(this.isShipper()){
        this.zoneKey = `${this.booking_ID}:shipper_zone`;
        this.sourceKey = 'O';
      }
      else{
        this.zoneKey = `${this.booking_ID}:consignee_zone`;
        this.sourceKey = 'D';
      }

      this.localStorageService.getData(this.zoneKey).subscribe((result) => {
        this.zone = result;
        if(this.authService.hasToken)
        {
          this.fetchDataLoad()
        }else{
          this.router.navigateByUrl("login");
        }
      });
    });

  }

  fetchDataLoad() {
    this.originDestinationService.getSpecialCharges(this.booking_ID, this.tariff_ID, this.zone, this.sourceKey).subscribe((response: any) => {
      var result = response.reduce(function (r, a, i) {
        r[a.charge_Type] = r[a.charge_Type] || [];
        a.charge_Amount = Number(a.charge_Amount).toFixed(2);
        r[a.charge_Type].push(a); return r;
      }, []);

      this.arrTabs.push(result);

      var props = Object.keys(result);

      for (let key of props) {

        var obj = {};
        var arr = [];
        var pSlashU = [];
        var del = [];
        var pud = [];
        var pudBooking = [];
        var def = [];

        pudBooking = result[key].filter((s) => s.special_Charge_ID && s.special_Charge_ID !== '0');

        if (this.isShipper()) {
          pSlashU = result[key].filter((r) => r.charge_Group === 'P/U' && r.special_Charge_ID == null ||  r.special_Charge_ID === '0');
        }
        else {
          del = result[key].filter((s) => s.charge_Group === 'DEL' && s.special_Charge_ID == null || s.special_Charge_ID === '0');
        }


        pud = result[key].filter((s) => s.charge_Group === 'PUD' && s.special_Charge_ID == null ||  s.special_Charge_ID === '0');
        def = result[key].filter((s) => s.charge_Group === 'DEF' && s.special_Charge_ID == null ||  s.special_Charge_ID === '0');

        arr = [...pudBooking, ...pSlashU, ...del, ...pud, ...def];

        obj[key] = arr;
        this.dataMap.push(obj);

        this.prevSelectedCharges = arr.filter((item) => item.special_Charge_ID &&  item.special_Charge_ID !== '0' && item.source_Key == this.sourceKey);
        this.selectedCharges = [...this.selectedCharges, ...this.prevSelectedCharges];
      }

    });

  }
  ngOnInit() {
    if(this.sourceKey === "D") {
      this.shouldDisableSection = this.rulesService.shouldSectionDisabled(SectionMapping.DELIVERY_SPECIAL_CHARGES);
    }else {
      this.shouldDisableSection = this.rulesService.shouldSectionDisabled(SectionMapping.PICKUP_SPECIAL_CHARGES);
    }
  }
  ngAfterViewInit() {
    // console.log('ngViewAfterInit');
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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.addTableCellResize();
  }

  addTableCellResize() {
    this.cdr.detach();
    const arrTr: any = document.querySelectorAll("tbody tr")[0].childNodes;
    const arrTh: any = document.querySelectorAll("thead tr")[0].childNodes;
    arrTr.forEach((td, i) => {
      arrTh[i].style.width = `${td.offsetWidth}px`;
    });
  }

  getlabel(itemObj: any, index) {
    return Object.getOwnPropertyNames(itemObj)[0];
  }

  getValues(itemObj: any, index) {
    return  Object.values(itemObj)[0];
  }

  selectedTabChange(event) {
    this.addTableCellResize();
  }

  checkboxHandle($event, selectedItem){

    if ($event.target.checked === true) {
      selectedItem.statusCode = !selectedItem.special_Charge_ID || selectedItem.special_Charge_ID === '0' ? 'I' : '';
      this.selectedCharges.push(selectedItem);
    }
    else {
      var indexToRemove = this.selectedCharges.findIndex((e) =>
        e.charge_Description === selectedItem.charge_Description &&
        e.charge_Group === selectedItem.charge_Group
      );

      if (selectedItem.special_Charge_ID && selectedItem.special_Charge_ID !== '0') {
        this.selectedCharges[indexToRemove].statusCode = selectedItem.special_Charge_ID ? selectedItem.statusCode = 'D' : selectedItem.statusCode = '';
      }
      else {
        this.selectedCharges.splice(indexToRemove, 1);
      }

    }
  }

  isShipper() {
    return this.type === 'shipper';
  }

  saveBtnClickHandler(event) {
    let shoairBillNumber : any = "";
    this.localStorageService.getData(`${this.booking_ID}:shoairbill_Number`).subscribe((result)=>{
      shoairBillNumber = result;
    })

    let specialCharges = [];
    for(let sp of this.selectedCharges){

        let specialCharge = new SpecialCharges();

        specialCharge.bookingId = this.booking_ID,
        specialCharge.chargeDescription = sp.charge_Description;
        specialCharge.chargeGroup = sp.charge_Group;
        specialCharge.chargeAmount = sp.charge_Amount;
        specialCharge.chargeDate = this.utilsService.getCurrentDate();
        specialCharge.chargeType = sp.charge_Type;
        specialCharge.serviceCode = sp.service_Code;
        specialCharge.shoairBillNumber = shoairBillNumber;
        specialCharge.specialChargeCodesId = sp.special_Charge_Codes_ID;//sp.special_Charges_Service_Code || "";
        specialCharge.specialChargeId = sp.special_Charge_ID;
        specialCharge.sourceKey = this.sourceKey
        specialCharge.tariffID = this.tariff_ID;
        // specialCharge.createdBy = this.authService.userId;
        // specialCharge.createdDate = this.utilsService.getCurrentDate();
        specialCharge.statusCode = sp.statusCode ? sp.statusCode : null;
        specialCharges.push(specialCharge);

    }

    if (specialCharges.length > 0) {
      this.originDestinationService.createSpecialCharges(specialCharges).subscribe(response => {
        if (response.error) {
          alert('Error-  create /specialcharges');
          return;
        }
        this.router.navigateByUrl(this.previousUrl);
      });
    }
    else {
      this.router.navigateByUrl(this.previousUrl);
   }
  }

  private isDirty(): boolean {
    return (this.prevSelectedCharges.length !== this.selectedCharges.length);
  }

}
