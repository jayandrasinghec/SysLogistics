import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import{MenuButtonService} from '../../../services/menu.service';
import {LocalStorageService} from '../../../services/localstorage.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-header',
  styleUrls: ['./header.scss'],
   templateUrl: './header.html'
})
export class HeaderComponent {

  constructor(private router:  Router , private dialogService : DialogService,private LSService:LocalStorageService ) {

  }

  menuClickHandler(event) {
    let url: string = event.display ;
    if (this.router.url.indexOf('dashboard') === -1){
      const dialogRef = this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE,Messages.CONFIRM_EXIT)
      
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
         // this.LSService.clearModuleRelatedKeys(url);
          this.LSService.clearAllkeys();
          if(url == 'operations'){
           MenuButtonService.instance.updateMenuScreen(url);
          }  
          this.router.navigateByUrl(url);
                  
        }
      });
    }
    else{
      this.router.navigateByUrl(url);
    }

  }
}
