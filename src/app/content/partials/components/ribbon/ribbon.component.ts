import { Component , Input, OnInit } from '@angular/core';
import {LocalStorageService} from '../../../../services/localstorage.service';
import { UtilsService } from 'src/app/services/Utils.service';
import AuthService from 'src/app/services/auth.service';
@Component({
  selector: 'app-ribbon',
  styleUrls: ['./ribbon.component.scss'],
   templateUrl: './ribbon.component.html'
})
export class RibbonComponent implements OnInit {

  userName: any;
  @Input() showOrderDetails: boolean;
  
  @Input() ribbonModel: any ;
  constructor(private localStorageService: LocalStorageService, private utilsService : UtilsService ) {
    this.userName = AuthService.getInstance().userName;
   }
   ngOnInit() {

   }

   getFormattedDateTime(dateTime){
     return this.utilsService.getDisplayDateTime(dateTime);
   }



}
