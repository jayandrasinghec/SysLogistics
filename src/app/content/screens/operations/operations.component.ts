import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import {OrderSearchService} from '../../../services/order-search.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { ApplicationService } from 'src/app/services/application.service';
import {ModelService} from 'src/app/services/model.service'
@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OperationsComponent implements OnInit, OnDestroy {

  public navTabs: any[];
  public operationModel:any; // model data
  public searchModel:any;

  private activeTabIndex:any =0;



  @ViewChild('orderid', {static: false}) ipOrderid: any;
  @ViewChild('airbilno', {static: false}) ipAirbilno: any;

  constructor(private orderSerchService: OrderSearchService,
              private localStorageService: LocalStorageService,
              private modelService:ModelService,
              private router:Router
            ) { }

  ngOnInit() {
    this.configOperationModel();
  
    console.log('ApplicationService.instance.order_id  : ',ApplicationService.instance.order_id);
  }
  ngOnDestroy() {
    this.operationModel = null;
    this.modelService.modelUpdated(this.operationModel);
  }

  configOperationModel(){
    if(ApplicationService.instance.order_id){
      this.localStorageService.getDataByOrderId('operation_order').subscribe((response)=>{
        if(response){
          this.operationModel = JSON.parse(response);
          this.modelService.modelUpdated(this.operationModel);
        }
      });
    }

  }
  

}
