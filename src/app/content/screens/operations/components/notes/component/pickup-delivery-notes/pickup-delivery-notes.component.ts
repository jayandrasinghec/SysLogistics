import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { OperationsService } from 'src/app/services/operation.service';
import { UtilsService } from 'src/app/services/Utils.service';
import AuthService from 'src/app/services/auth.service';

@Component({
  selector: 'app-pickup-delivery-notes',
  templateUrl: './pickup-delivery-notes.component.html',
  styleUrls: ['./pickup-delivery-notes.component.scss']
})
export class PickupDeliveryNotesComponent implements OnInit {

  private notesSubscription : Subscription;
  public pickupComments : any[];
  public delComments : any[];

  constructor(
    private operationService : OperationsService,
    private utilsService : UtilsService
  ) { 
    this.configComments();
  }

  ngOnInit() {
  }

  configComments(){
    /*Needs to fetch comments and add new empty row after-*/
    this.notesSubscription = this.operationService.commentsData$.subscribe((result:any)=>{
      if(result){
        console.log('COMMENTS AVAILABLE PICKUP',result );

        this.pickupComments = (result.length>0)? result.filter(item => item.note_type == 'P/U'):[];
        this.delComments = (result.length>0)? result.filter(item => item.note_type == 'DEL'):[];
      }    
   });   
  }

  getuserName(userId) 
  {
    return userId == AuthService.getInstance().userId ? AuthService.getInstance().userName : userId;
  }

  getFormattedDate(dateTime){
    return this.utilsService.getDisplayDate(dateTime);
  }

  getFormattedTime(dateTime){
    return this.utilsService.getDisplayTime(dateTime);
  }
}
