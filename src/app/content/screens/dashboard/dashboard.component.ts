import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {DashboardService} from 'src/app/services/dashboard.service';
import AuthService from 'src/app/services/auth.service';
import {LocalStorageService}  from 'src/app/services/localstorage.service';
import { ApplicationService } from 'src/app/services/application.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  isBooking:boolean;
  bookingType:any;
  divisions:any =[];
  authService:any;
  showSpinner:boolean = false;

   constructor( private router: Router,
                private dashboardService: DashboardService,
                private localStorageService: LocalStorageService,
                private rulesService: BusinessRulesService) {
    // this.bookingType = "domestic";
    //this.localStorageService.clear(`${ApplicationService.instance.order_id}:order`);
    //this.localStorageService.clear(`${ApplicationService.instance.order_id}:view_booking_id`);
    //this.localStorageService.clear(`${ApplicationService.instance.order_id}:view_order_id`);
    //this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    // this.localStorageService.clear(`order_status:${ApplicationService.instance.order_id}`);
    //this.localStorageService.clear(`${ApplicationService.instance.order_id}:edit_order_saved`);
    if (ApplicationService.instance.order_id){
      this.localStorageService.clearOrderData(ApplicationService.instance.order_id);
    }
    if (ApplicationService.instance.booking_id){
      this.localStorageService.clearBookingData(ApplicationService.instance.booking_id);
    }
    this.authService = AuthService.getInstance();
    if(this.authService.hasToken)
    {
      this.fetchDataLoad()
    }else{
      this.router.navigateByUrl("login");
    }
  }

  fetchDataLoad(){
    this.isBooking  = true;
    this.showSpinner = true;
    this.localStorageService.getData(`divisions`).subscribe((result) => {
      if(result && result != "undefined"){
          this.divisions = JSON.parse(result);
          this.showSpinner = false;
      }else{
        //this.dashboardService.getDivisionData().subscribe((response) => {
          this.divisions = [{"code":"10","description":"Domestic"},{"code":"20","description":"International"},{"code":"30","description":"Asset Management"}];
          this.showSpinner = false;
          this.localStorageService.saveData('divisions', JSON.stringify(this.divisions))
      //});
      }

    });
  }


  ngOnInit() {
  }

  displayClickHandler(event){
    console.log('displayClickHandler',event )
    this.isBooking  = true;
  }

  newOrderClickHandler(event){
    this.rulesService.clearRules();
     if(this.bookingType == '10'){
       this.localStorageService.saveData(`selectedDivision`, this.bookingType);
      //if(this.bookingType == 'domestic'){
      this.router.navigateByUrl("booking/billto")
    }
  }

  radioBtnChangehandler(event){}

}
