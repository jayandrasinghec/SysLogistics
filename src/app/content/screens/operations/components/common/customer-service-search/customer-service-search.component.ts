import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {UtilitiesService} from '../../../../../../services/utilities.service';
import {OperationsService} from '../../../../../../services/operation.service';
import {BillToService} from '../../../../../../services/billto.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { ApplicationService } from 'src/app/services/application.service';
import { Router, ActivatedRoute  } from '@angular/router';
import {ExportService} from '../../../../../../services/export.service';
import { UtilsService } from '../../../../../../services/Utils.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-customer-service-search',
  templateUrl: './customer-service-search.component.html',
  styleUrls: ['./customer-service-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerServiceSearchComponent implements OnInit {

  private orderID:any;
  public orderObj:any;
  public ddShows_Headers:any[] =[["ID","show_id"],["Description","show_description"]];
  public shows:any[]=[];

  public bookingAgentHeaders: any[] = [['ID','agent_id'],['NAME','agent_name']];
  public bookingAgents:any[] =[];


  public rebateAgentsHeaders: any[] = [['ID','agent_id'],['NAME','agent_name']];
  public rebateAgents:any[] =[];

  public companyLocationsheaders: any[] = [['CODE','locations_code'],['NAME','locations_name']];
  public companyLocations:any[]=[];

 public billToNameHeaders: any[] = [['CODE','customer_code'],['NAME','address_name'],['ADDRESS','addr1'],['CITY','addr_sort1'],['STATE','addr_sort2'],['ZIP','addr_sort3'],['PHONE','attention_phone']];
 public ddBillToOptions:any[]=[];

 public searchTerms:any;
 public formModel:any;

 public divisions:any[]=[];
 public gridList:any[] =[];
 public isEditMode:boolean=true;
 public is_Edit_Code:boolean = true;
 public is_Edit_loadDateFrom:boolean = true;
 public is_Edit_loadDateTo:boolean = true;
 public is_Edit_deliveryDateFrom:boolean = true;
 public is_Edit_deliveryDateTo:boolean = true;
 public autoComplete:any;
 public isEditUrl:boolean;
 public companyLocation: any;
 public selectedOrigShow: any;
 public selectedDestShow: any;
 public ddReset: boolean = false;
 public bookingAgent: any;
 public rebateAgent:any;
 public minDate:any;
 public isDelDateValid:boolean;

  constructor(private utilitieService:UtilitiesService,
              private operationService:OperationsService,
              private billtoService:BillToService ,
              private localStorageService: LocalStorageService, 
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private dialogService : DialogService,
              private exportService: ExportService,
              private utilsService:UtilsService,
              private rulesService:BusinessRulesService
               ) { }

  ngOnInit() {
    this.getOrderObject();
    this.configModel();
    this.getShows();
    this.getCustomerNumber();
    this.getBookingAgents();
    this.getRebateAgents();
    this.getCompanyLocations();
    this.getDivisions();
    this.checkRules();
  }
  getOrderObject(){
        
       this.orderID = this.activatedRoute.snapshot.paramMap.get('orderid') ;
       const order :any = this.localStorageService.getItem(`${this.orderID}:operation_order`);
       this.orderObj = JSON.parse(order);
       
  }
  configModel(){
      this.formModel ={
          billTo_Name: "",
          booking_Agent_ID: "",
          carrier_Code: "",
          delivery_Date_From: "",
          delivery_Date_To: "",
          dest_Air_Code: "",
          dest_Show: "",
          division_Code: "",
          load_Date_From: "",
          load_Date_To: "",
          location_ID: "",
          master_Bill_Number: "",
          order_ID: 0,
          origin_Air_Code: "",
          origin_Show: "",
          po_Number: "",
          rebate_Agent_ID: "",
          shoair_Bill_Number: ""
        }
  }
  getShows(){
    this.utilitieService.getShows().subscribe((response:any)=>{
      this.shows=response;
    });
  }
  getCustomerNumber(){
   /* this.billtoService.search().subscribe((response:any)=>{

    })*/
  }
  getBookingAgents(){

     this.billtoService.getBookingAgents(this.orderObj.customer_code).subscribe((response:any)=>{
    this.bookingAgents = response;
     }); 
  }
  getRebateAgents(){
     this.billtoService.getRebateAgents().subscribe((response:any)=>{
        this.rebateAgents = response ;
     });
  }
  getCompanyLocations(){
     this.utilitieService.getCompanyLocations().subscribe((response:any)=>{
      this.companyLocations = response;
    });
  }
  getDivisions(){
      this.utilitieService.getDivisions().subscribe((response:any)=>{
      this.divisions = response;
    });
  }

  ddOriginShowSelecthandler(event){
    console.log('origin_Show   ',event);
     this.formModel.origin_Show = event['show_id'];
  }
  ddDestinationShowSelecthandler(event){
     this.formModel.dest_Show = event['show_id'];
  }
  bookingagentSelecthandler(event){
    this.formModel.booking_Agent_ID = event['agent_id'];
  }
  rebateAgentSelecthandler(event){
    this.formModel.rebate_Agent_ID = event['agent_id'];
  }
  cmpLocationSelecthandler(event,key){
     this.formModel.location_ID = event[key];
  }
  dateChangehandler(event,key)
  {
      this.formModel[key] = this.convert(event.value) ;
  }
  changeModel(event,key){
   this.formModel[key] = event;
  }
  handleRadioClick(code:any){
  this.formModel.division_Code = code;
  }




  /*-------BTN Clickhandler */


  serchTextChangehandler(event) {
      if(event.trim() == "")
      {
        return;
      }
      if (this.searchTerms !== event ) {
        this.searchTerms = event ;
        this.billtoService.search(event).subscribe((response:any) => {
          if(this.searchTerms !== response.term ) {
            return;
          }
          this.ddBillToOptions =  [];
          if(response.error){
            const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,Messages.SERVER_ERROR);
            return;
          }
          else if(response && response.result && response.result.length == 0) {
            const dialogRef = this.dialogService.showInfoPopup(Messages.SEARCH_ORDER_TITLE,Messages.NO_RECORDS);
            return;
          }
          else{
            this.ddBillToOptions =  response.result;
          }
        });
      }
  }
 ddBillToChangeHandler(event) {
    console.log('ddBillToChangeHandler', event);   
    this.formModel.billTo_Name = event['address_name'];
  }
  exportCickHandler(event) {
     if(this.gridList && this.gridList.length>0){
         this.exportService.exportExcel(this.gridList , `searchResults_${this.utilsService.getCurrentDate_MMDDYYYY("-")}`);
     }    
  }

  searchCickHandler(event){
   // console.log('this.formModel   : ',this.formModel);
     
      this.operationService.extendedSearch(this.formModel).subscribe((result:any)=>{
        if(result.error){
          alert('Error - customer/order/search');
          return;
        }
        console.log('result   ',result);
        this.gridList = result ;

      });       
  }
  clearCickHandler(event){
    this.gridList=[];
    this.companyLocation = '';
    this.selectedOrigShow = '';
    this.bookingAgent ='';
    this.selectedDestShow = '';
    this.rebateAgent='';
    this.configModel();
  }
  closeCickHandler(event){
  /* if(this.isDirty()){
    this.showWarning();
    return;
    } */
    const prevURL:string =  this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.router.navigateByUrl(prevURL);
  }
  convert(date) {
    console.log('convert date', date);
    const mnth = ("0" + (date._i.month + 1)).slice(-2);
    const day = ("0" + date._i.date).slice(-2);
    return [date._i.year, mnth, day].join("-");
  }
  getBgColor(item:any){
      let bgColor:any
     
        switch(item.no_Move_Code){
            case 'BO':
            bgColor = '';
            break;
            case 'CL':
            bgColor = '#ee4d1f';
            break;
            case 'DHL':
            bgColor = '#f4ed03';
            break;
            case 'DT':
            bgColor = '#76ad07';
            break;
            case 'FEDX':
            bgColor = '#9c27b0';
            break;
             case 'HCC':
            bgColor = '#f9b911';
            break;
            case 'NB':
            bgColor = '';
            break;
            case 'NBCSE':
            bgColor = '';
            break;
            case 'NM':
            bgColor = '';
            break;
            case 'RI':
            bgColor = '#e91e63';
            break;
            case 'SPOC':
            bgColor = '#1baaec';
            break;
            case 'UPS':
            bgColor = '#b4b028';
            break;
           default:
            bgColor = '#ffffff';
            break;

        }
        return  bgColor;
       
  }
  navToOperation(orderID:any){
      const navUrl:string = `operations/pickup/${orderID}`
      this.router.navigateByUrl(navUrl);
      
  }

  public isEditable(fieldName) {
    if(this.isEditMode && fieldName) {
      return this.rulesService.shouldEditable(fieldName);
    }
    return this.isEditMode;
  }

  private checkRules(){
    this.is_Edit_Code = this.isEditable('code');
    this.is_Edit_loadDateFrom = this.isEditable('load_Date_From');
    this.is_Edit_loadDateTo = this.isEditable('load_Date_To');
    this.is_Edit_deliveryDateFrom = this.isEditable('delivery_Date_From');
    this.is_Edit_deliveryDateTo = this.isEditable('delivery_Date_To')
  }

}
