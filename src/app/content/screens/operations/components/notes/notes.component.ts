import { Component, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { OperationsService } from 'src/app/services/operation.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  public navTabs : any[];
  private prevUrl:any;
  private activeTabIndex:any =0;
  private operationOrderID:any;
  private routingData:any;

  constructor(
    private router : Router,
    private localStorageService : LocalStorageService,
    private activatedRoute : ActivatedRoute,
    private operationService : OperationsService
  ) { }

  ngOnInit() {
    this.configTabs();
    this.prevUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
    //this.operationOrderID = this.activatedRoute.snapshot.paramMap.get('orderid');
    this.operationOrderID = (this.router.url.split('/').length==5)?this.router.url.split('/')[4]:null ;
    if(this.operationOrderID){
      this.getRoutingNotes();     
    }
    this.setActiveIndexOnLoad(this.router.url);
  }

  getRoutingNotes(){
   this.localStorageService.getData(`${ApplicationService.instance.order_id}:routing_notes`).subscribe((result:any)=>{
       if(result){
          this.routingData = JSON.parse(result); 
          console.log('  this.routingData ', this.routingData);
          this.localStorageService.saveData(`${ApplicationService.instance.order_id}:routing_notes`,JSON.stringify(this.routingData));
          this.operationService.updateCommentsDatas(this.routingData);
          
       }else{
          this.operationService.geRouting(ApplicationService.instance.order_id).subscribe((result:any)=>{
             if(result.error){
               alert('Error - order/routing/notes?orderid=');
             }
               this.routingData = result;   
               for(const index in this.routingData ){
                 this.routingData[index].id = `${this.routingData[index].note_type}_${index} `;
               }
               this.localStorageService.saveData(`${ApplicationService.instance.order_id}:routing_notes`,JSON.stringify(this.routingData));
               this.operationService.updateCommentsDatas(this.routingData);
           });
       }
   })
 }

  configTabs(){
    this.navTabs = [
      {   label: 'Pickup & Devilery',
          link: 'operations/notes/pickup-delivery-note/%orderId%', index: 0,
          isActive: false,
          isDisabled: false,
          isFormEditable:false
        },
        {
            label: 'Transfer',
            link: 'operations/notes/tranfer-note/%orderId%', index: 1,
            isActive: false, isDisabled: false,
            isFormEditable:false },
        {
            label: 'Routing',
            link: 'operations/notes/routing-note/%orderId%', index: 2,
            isActive: false, isDisabled: false,
            isFormEditable:false
        }
      ];
  }

  tabClickhandler(event,index){
    
       // this.navigateTab(index);   
       this.navTabs[this.activeTabIndex].isActive = false;
       this.activeTabIndex = index;
       this.navTabs[this.activeTabIndex].isDisabled = false;
       this.navTabs[this.activeTabIndex].isActive = true;
       const viewOrderId = ApplicationService.instance.order_id;
    
       for (let navLink of this.navTabs) {
        if (navLink.link.indexOf('%orderId%') !== -1) {
          navLink.link = navLink.link.replace('%orderId%', viewOrderId);
        }
        else {
          const slashLastIndex = navLink.link.lastIndexOf('/');
          navLink.link = navLink.link.substring(0, slashLastIndex) + '/' + viewOrderId + navLink.link.substring(navLink.link.length);
        }
      }
      this.router.navigate([this.navTabs[this.activeTabIndex].link]);
  }
      
  closeBtnClickhandler(event){
        this.router.navigateByUrl(this.prevUrl);
  }    

   setActiveIndexOnLoad(url: string) {
    this.navTabs[this.activeTabIndex].isActive = false;
    const arrUrl = ['pickup-delivery-note', 'tranfer-note', 'routing-note'];
    for (const index in arrUrl) {
      if (url.indexOf(arrUrl[index]) !== -1) {
        this.activeTabIndex = index;
      }
    }
    this.navTabs[this.activeTabIndex].isDisabled = false;
    this.navTabs[this.activeTabIndex].isActive = true;
  } 

}
