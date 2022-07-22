import { Component, OnInit } from '@angular/core';
import AuthService from '../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import {LocalStorageService} from '../../../../services/localstorage.service'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public model: any = {username: null, password: null};
  public showValidationError: boolean = false;
  showSpinner:boolean = false;
  constructor(private http: HttpClient, private router: Router, private locStorage: LocalStorageService) { }

  ngOnInit() {
    if(AuthService.getInstance().hasToken){
      this.router.navigateByUrl('dashboard');
    }
    else{
      this.locStorage.clearAll();
    }    

  }

  async onSubmit(form) {
    if (form.valid) {
      this.showSpinner = true;
      this.showValidationError = false;
      const response: any = await AuthService.getInstance(this.http, this.locStorage).login(this.model);
      if (response && response.success === true) {
        this.router.navigateByUrl(`dashboard`);
      } else {
        this.showValidationError = true;
        this.showSpinner = false;
      }

    }
  }

}
