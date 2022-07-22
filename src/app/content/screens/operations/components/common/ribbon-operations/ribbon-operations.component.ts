import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {ModelService} from '../../../../../../services/model.service';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RoutingService } from 'src/app/services/routing.service';
@Component({
  selector: 'app-ribbon-operations',
  templateUrl: './ribbon-operations.component.html',
  styleUrls: ['./ribbon-operations.component.scss']
})
export class RibbonOperationsComponent implements OnInit,OnDestroy {

  public model:any;
  private modelSubscription:any;
  public userName:string;
  public bookDate:string;
  public progress = 0;
  public description:string;
  // private destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private modelService:ModelService,
    private utilsService:UtilsService,
    private routingService: RoutingService) { }

  ngOnInit() {

    this.userName = AuthService.getInstance().userName;
    this.modelSubscription = this.modelService.modelUpdate$.subscribe((response:any)=>{
      if (response &&  response != null) {
        this.model = response;
        this.bookDate = this.utilsService.getDisplayDateTime(this.model.created_Date);
        this.getRoutingStatus(this.model.order_ID);
      }else{
          this.model = null;
      }
    });

    this.routingService.updateRoutingStatus$.pipe().subscribe((event)=> {
      this.getRoutingStatus(this.model.order_ID);
    });

  }

  getRoutingStatus(orderId) {
    this.routingService.getRoutingStatus(orderId)
    // .pipe(takeUntil(this.destroy$))
    .subscribe((result)=> {
      if(result.length) {
        this.progress = result[0].percent_Complete;
        this.description = result[0].description;
      }
      else {
        this.progress = 0;
        this.description = '';
      }
    });
  }
  ngOnDestroy() {
    this.modelService.reset();
    this.modelSubscription.unsubscribe();
    this.modelSubscription = null;
    this.model = null;

    // this.destroy$.next(true);
    // this.destroy$.unsubscribe();
  }

}
