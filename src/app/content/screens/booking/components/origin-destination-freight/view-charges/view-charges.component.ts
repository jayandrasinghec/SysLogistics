import { Component, OnInit, ChangeDetectorRef,HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import AuthService from 'src/app/services/auth.service';
import { OrigindestinationFreightService } from 'src/app/services/origin-destination-freight.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';

@Component({
  selector: 'app-view-charges',
  templateUrl: './view-charges.component.html',
  styleUrls: ['./view-charges.component.scss']
})
export class ViewChargesComponent implements OnInit {
  arrPricesDetails: Array<any> = []
  booking_ID: any;
  authService: any;
  type:any
  totalCharges: any = 0.00;
  tariff_ID:any;
  zoneKey:any;
  zone:any;
  sourceKey:any;
  previousUrl:string;

  constructor(private router: Router,
              private cdr: ChangeDetectorRef,
              private activatedRoute: ActivatedRoute,
              private originDestinationService: OrigindestinationFreightService,
              private localStorageService : LocalStorageService) {
    this.totalCharges = "0";
    this.booking_ID = activatedRoute.snapshot.paramMap.get('id');
    ApplicationService.instance.booking_id = this.booking_ID;
    this.previousUrl = this.localStorageService.getItem(`${this.booking_ID}:navigateUrl`);
    this.type = activatedRoute.snapshot.paramMap.get('type');
    this.authService = AuthService.getInstance();
    this.localStorageService.getData(`${this.booking_ID}:tariff_ID`).subscribe((result) => {
      this.tariff_ID = result;
      if(this.isShipper())
      {
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
      // this.arrPricesDetails = response;
      var pSlashU = [];
      var del = [];
      var pud = [];
      var def = [];

      if (this.isShipper()) {
        pSlashU = response.filter((r) => r.special_Charge_ID !== null && r.special_Charge_ID > 0 && r.charge_Group === 'P/U' && r.source_Key === this.sourceKey);

      }
      else {
        del = response.filter((s) => s.special_Charge_ID !== null && s.special_Charge_ID > 0 && s.charge_Group === 'DEL' && s.source_Key === this.sourceKey);
      }

      pud = response.filter((s) => s.special_Charge_ID !== null && s.special_Charge_ID > 0 && s.charge_Group === 'PUD' && s.source_Key === this.sourceKey);
      def = response.filter((s) => s.special_Charge_ID !== null && s.special_Charge_ID > 0 && s.charge_Group === 'DEF' && s.source_Key === this.sourceKey);

      this.arrPricesDetails = [...pSlashU, ...del, ...pud, ...def];
      this.arrPricesDetails =  this.arrPricesDetails.reduce(function (r, a, i) {
        a.charge_Amount = Number(a.charge_Amount).toFixed(2);
        r.push(a); return r;
      }, []);
      this.totalCharges = this.arrPricesDetails.reduce((totalCharges, obj) => (Number(obj.charge_Amount) + Number(totalCharges)).toFixed(2), "0.00");

    });

  }

  isShipper() {
    return this.type === 'shipper';
  }


  ngOnInit() {
  }
  ngAfterViewInit() {
    // console.log('ngViewAfterInit');
    // this.addTableCellResize();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.addTableCellResize();
  }
  closeBtnClickHandler(event) {
    this.router.navigateByUrl(this.previousUrl);
  }
  addTableCellResize( ) {
    this.cdr.detach();
    const arrTr: any = document.querySelectorAll("tbody tr")[0].childNodes;
    const arrTh: any = document.querySelectorAll("thead tr")[0].childNodes;
    arrTr.forEach( (td , i) => {
               arrTh[i].style.width = `${td.offsetWidth}px` ;
    });

 }
}
