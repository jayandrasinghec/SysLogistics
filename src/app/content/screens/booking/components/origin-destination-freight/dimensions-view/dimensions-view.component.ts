import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrigindestinationFreightService } from 'src/app/services/origin-destination-freight.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { MatDialog } from '@angular/material';
import { ApplicationService } from 'src/app/services/application.service';
import AuthService from 'src/app/services/auth.service';

@Component({
  selector: 'app-dimensions-view',
  templateUrl: './dimensions-view.component.html',
  styleUrls: ['./dimensions-view.component.scss']
})
export class DimensionsViewComponent implements OnInit {

  booking_ID:any;
  authService:any;
  freightDimensions:any[];
  totalPieces: number = 0;
  totalDimInLBS:any = 0;
  totalDimInKG:any = 0;
  previousUrl:string;

  constructor(private router: Router,
              private cdr: ChangeDetectorRef,
              private odfService: OrigindestinationFreightService,
              private localStorageService: LocalStorageService,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog) {

    this.booking_ID = activatedRoute.snapshot.paramMap.get('id');
    ApplicationService.instance.booking_id = this.booking_ID;
    this.previousUrl = this.localStorageService.getItem(`${this.booking_ID}:navigateUrl`);
    this.authService = AuthService.getInstance();
    if (this.authService.hasToken) {
      this.fetchDataLoad()
    } else {
      this.router.navigateByUrl("login");
    }
  }

  ngOnInit() {
  }

  fetchDataLoad() {
    this.freightDimensions = new Array();

    this.odfService.getCalculateDimensions(this.booking_ID).subscribe((response) => {
      if (response && response.dimensions.length > 0) {
        for (let dimension of response.dimensions) {
          this.freightDimensions.push(dimension);
        }
        this.updateTotal();
      }

    })
  }

  updateTotal() {
    this.totalPieces = 0;
    this.totalDimInLBS = 0;
    this.totalDimInKG = 0;
    this.freightDimensions.forEach(row => {
      this.totalPieces = (row.pieces !== undefined && row.statusCode !== 'D') ? (this.totalPieces + Number(row.pieces)) : this.totalPieces;
      this.totalDimInLBS = (row.weightInLb !== undefined && row.statusCode !== 'D') ? ((Number(this.totalDimInLBS) + Number(row.weightInLb)).toFixed(2)) : this.totalDimInLBS;
      this.totalDimInKG = (this.totalDimInLBS != undefined && row.statusCode !== 'D') ? ((Number(this.totalDimInLBS) / 2.20462).toFixed(2)) : this.totalDimInLBS;
    });
  }

  closeBtnClickHandler(event) {
    this.router.navigateByUrl(this.previousUrl);
  }

}
