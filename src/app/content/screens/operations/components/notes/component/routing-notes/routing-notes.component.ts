import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { OperationsService } from 'src/app/services/operation.service';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';

@Component({
  selector: 'app-routing-notes',
  templateUrl: './routing-notes.component.html',
  styleUrls: ['./routing-notes.component.scss']
})
export class RoutingNotesComponent implements OnInit {

  private notesSubscription : Subscription;
  public routingNotes: any

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

        this.routingNotes = (result.length>0)? result.filter(item => item.note_type == 'Airline'):[];
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
