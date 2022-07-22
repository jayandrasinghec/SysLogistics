import {Component, OnInit,OnDestroy,	ViewEncapsulation, ViewChildren, QueryList , HostListener, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import {InputTextComponent} from '../../../../partials/components/inputtext/inputtext.component';
import {DropDownComponent} from '../../../../partials/components/dropdown/dropdown.component';
import {ZIPCodeComponent} from '../../../../partials/components/zip-code/zip-code.component';
import {AutopopulateInputTextComponent} from '../../../../partials/components/autopopulate-inputtext/autopopulate-inputtext.component';
import {ValidateService} from '../../../../../services/validate.service';
import {BillToService} from '../../../../../services/billto.service';
import {BookingService} from '../../../../../services/booking.service';
import { Subscription } from 'rxjs/internal/Subscription';
import {BillToIntelModel} from '../../../../../core/models/billto-intel.model';
import {BillToMicrosoftModel} from '../../../../../core/models/billto-microsoft.model';
import {ApplicationService} from '../../../../../services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import AuthService from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { DropdownGridComponent } from 'src/app/content/partials/components/dropdown-grid/dropdown-grid.component';
import CreditCardInfo from 'src/app/core/models/credit-card-info.model';
import BookingOrder from 'src/app/core/models/booking-order.model';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-billto',
  templateUrl: './billto.component.html',
  styleUrls: ['./billto.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BillToComponent implements OnInit, OnDestroy {
  isValid:Boolean = false;
  isCCValid:Boolean = false;

  @ViewChildren(InputTextComponent) inputTextComponent: QueryList<InputTextComponent>;
  @ViewChildren(DropDownComponent) dropDownComponent: QueryList<DropDownComponent>;
  @ViewChildren(DropdownGridComponent) dropDownGridComponents: QueryList<DropdownGridComponent>;
   @ViewChildren(ZIPCodeComponent) zipCodeComponent: QueryList<ZIPCodeComponent>;
  @ViewChildren(AutopopulateInputTextComponent) autopopulateInputText: QueryList<AutopopulateInputTextComponent>;


  billToNameHeaders: any[] = [['CODE','customer_code'],['NAME','address_name'],['ADDRESS','addr1'],['CITY','addr_sort1'],['STATE','addr_sort2'],['ZIP','addr_sort3'],['PHONE','attention_phone']];
  rebateAgentsHeaders: any[] = [['ID','agent_id'],['NAME','agent_name']];
  bookingAgentHeaders: any[] = [['ID','agent_id'],['NAME','agent_name']];
  companyLocationsheaders: any[] = [['CODE','locations_code'],['NAME','locations_name']];
  bookingMethodsheaders : any[] = [['TYPE','type'],['DESCRIPTION','description']];
  intelLocationsheaders: any[] = [['CODE','locations_code'],['NAME','locations_name']];
  creditCardheaders: any[] = [['CARD NUMBER','card_number'],['EXPIRATION MM/YYYY','expiration_mmyy'],['TYPE','credit_card_type'],
                                  ['FIRST NAME','first_name'], ['LAST NAME','last_name']];
  creditCardTypeHeaders: any[] = [['TYPE','type']]
  //{type:"WIRE"} not a part of cc type
  ddcreditCardTypes = [{type : "CREDCARD"}, {type : "CREDTCRD"},{type : "VISA"},{type : "AMEX"},{type : "VISA-1"},{type : "AMEX-1"},{type : "MC"}]
  creditCardTypes = [ "CREDCARD","CREDTCRD","VISA","AMEX", "VISA-1", "AMEX-1","MC"]
  months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  years:any = [];

  ddBillToOptions: any[];
  bookingAgents: any[];
  bookingMethods: any[];
  companyLocations: any[];
  rebateAgents: any[];
  creditCardInfos: any[];

  // Default selected value
  bookingAgent: any;
  bookingMethod: any;
  companyLocation: any;
  rebateAgent: any;
  creditCard: any;
  creditCardInfo: any;
  intelLocation: any;
  creditCardType : any;
  selectedMonth:any;
  selectedYear:any;

  intelLocations: any[];
  private searchTerms : string;
  ddReset: boolean = false;
  ddOptions:any;
  selectedClient: any;
  origClient:any;
  selectedCard: any;
  private validateSubscription: Subscription;
  private routerSubscription: Subscription;
  /*-------------*/
  model: BookingOrder;
  intelModel: BillToIntelModel;
  microsoftModel: BillToMicrosoftModel;
  ccModel:CreditCardInfo;
  isMicrosoftModel:boolean = false;
  isIntelModel:boolean = false;
  authService:any;
  displayCreditCardPop:boolean = false;
  approvalNumber:any;
  ePay_Customer_Number:any;
  isEditMode:boolean = true; // EditMode is true in case of edit-booking and fresh booking.
  isEditUrl:boolean;
  autoComplete:any;
  
  constructor(private validateService: ValidateService,
              private billToService: BillToService,
              private bookingService: BookingService,
              private localStorageService: LocalStorageService,
              private activatedRoute: ActivatedRoute,
              private utilsService : UtilsService,
              private router : Router,
              private dialogService : DialogService,
              private cdr: ChangeDetectorRef) {
    ApplicationService.instance.order_id = activatedRoute.snapshot.paramMap.get('orderId');
    const bookingId = activatedRoute.snapshot.paramMap.get('id') || localStorageService.getItem(`${ApplicationService.instance.order_id}:view_booking_id`);
    this.model = new BookingOrder();
    this.model.order_ID = localStorageService.getItem(`${ApplicationService.instance.order_id}:view_order_id`);
    this.model.booking_ID = bookingId || 0;
    ApplicationService.instance.booking_id = this.model.booking_ID;
    this.intelModel = new BillToIntelModel();
    this.microsoftModel = new BillToMicrosoftModel();
    this.authService = AuthService.getInstance();
   /* if(this.authService.hasToken)
    {
      //Note: If url is for view/edit-booking, than need to call bill to api for epay_customernumber, displayflag and customer_type
      this.fetchDataLoad()
    }else{
      this.router.navigateByUrl("login");
    }*/

    this.fillYears();
    this.routerSubscription = this.router.events.subscribe((event)=>{this.init(event)})
  }
  init(event){
    if(event instanceof NavigationEnd){
      this.isEditMode = (event.url.indexOf('view-booking')!== -1)?false:true;
      this.isEditUrl = (event.url.indexOf('edit-booking')!== -1)?true: false;
      if(this.authService.hasToken)
      {
        //Note: If url is for view/edit-booking, than need to call bill to api for epay_customernumber, displayflag and customer_type
        this.fetchDataLoad()
      }else{
        this.router.navigateByUrl("login");
      }
    }
  }

  fetchDataLoad(){
    if(this.model.booking_ID && this.model.booking_ID != 0){
     // if(this.model.order_ID){
        const orderType = (this.isEditUrl) ? 'editBookingOrder' : 'bookingOrder';
        this.localStorageService.getData(`${this.model.booking_ID}:${orderType}`).subscribe((result)=>{
        // this.bookingService.getOrderData(this.model.order_ID).subscribe(async (result:any)=>{
          if(result){
                this.model =  JSON.parse(result);
                this.billToService.search(this.model.billTo_Name).subscribe((response:any) => {
                this.ddBillToOptions =  response.result;
                this.origClient = this.selectedClient = response.result.filter(x => x.customer_code == this.model.customer_Code)[0];
                this.ePay_Customer_Number = (this.selectedClient && this.selectedClient.ePay_Customer_Number)?this.selectedClient.ePay_Customer_Number:null;
                this.localStorageService.saveData('ePay_Customer_Number', this.ePay_Customer_Number);
                this.populateDataOnLoad();
              })
            }
            else{
              this.bookingService.getBookingData(this.model.booking_ID).subscribe(async (result:any)=>{
                  this.model =  await result;
                  this.billToService.search(this.model.billTo_Name).subscribe((response) => {
                    this.ddBillToOptions =  response.result;
                    this.origClient =  this.selectedClient = response.result.filter(x => x.customer_code == this.model.customer_Code)[0];
                    this.ePay_Customer_Number = (this.selectedClient &&  this.selectedClient.ePay_Customer_Number)?this.selectedClient.ePay_Customer_Number:null;
                    this.localStorageService.saveData('ePay_Customer_Number', this.ePay_Customer_Number);
                    this.populateDataOnLoad();
                  })
                  });
            }
        });
    }
    else{
      this.populateRebateAgents();
      this.populateCompanyLocations();
      this.populateBookingMethods();
      this.localStorageService.getData(`selectedDivision`).subscribe((result) => {
        this.model.division_Code = result;
      });
    }
  }

  populateDataOnLoad(){
    this.populateBookingAgents(false);
    this.populateRebateAgents();
    this.populateCompanyLocations();
    this.populateBookingMethods();
    this.populateCreditCardInfo(false);
    this.isMicrosoft();
    this.isIntel();
    if(this.isEditUrl) {
      if(this.isIntelModel || this.isMicrosoftModel){
        this.populateSpecialAccount();
      }
      return ;
    }
    if(this.isMicrosoftModel)
    {
      this.bookingService.getSpecialAccountData(this.model.booking_ID).subscribe((result:any)=>{
        this.microsoftModel =  result;
      })
    }
    if(this.isIntelModel)
    {
      this.bookingService.getSpecialAccountData(this.model.booking_ID).subscribe((result:any)=>{
        this.intelModel =  result;
        this.populateIntelLocations();
      })
    }
  }
populateSpecialAccount() {
  /* if it is Edit mode first check in local storage editSpecialAccount othewise it will fetch from server  */
  this.localStorageService.getData(`${this.model.booking_ID}:editSpecialAccount`).subscribe((result:any) => {
    if(result ) {
      if(result !== 'delete') {
        if(this.isIntelModel) {
          this.intelModel =  JSON.parse(result);
          this.populateIntelLocations();
        } else if(this.isMicrosoftModel) {
          this.microsoftModel =  JSON.parse(result);
        }
        this.cdr.detectChanges();
      }
    } else {      
      this.bookingService.getSpecialAccountData(this.model.booking_ID).subscribe((response:any) => {
        if(this.isIntelModel) {
          this.intelModel =  response;
          this.populateIntelLocations();
        } else if(this.isMicrosoftModel) {
          this.microsoftModel =  response;
        }
        this.cdr.detectChanges();
      });
    }
  });

}
ngOnInit(): void {
  this.validateSubscription = this.validateService.validateComponentEvent$.subscribe(event => {
    this.validateAndSend(event)
  });
  this.isValid = true;   
}

ngAfterViewInit(){

}
ngOnDestroy(): void {
  this.validateSubscription.unsubscribe();
  this.validateSubscription = null;
  this.routerSubscription.unsubscribe();
  this.routerSubscription=null;
}

populateRebateAgents(){
  this.localStorageService.getData(`${this.model.booking_ID}:rebateAgents`).subscribe((result) => {
      if(result && result!=='undefined'){
          this.rebateAgents = JSON.parse(result);
          this.bindRebateAgents()
      }else{
          this.billToService.getRebateAgents().subscribe(response => {
          this.rebateAgents = response;
          this.bindRebateAgents()
          if(this.model.booking_ID && this.model.booking_ID != 0){
            this.localStorageService.saveData(`${this.model.booking_ID}:rebateAgents`, JSON.stringify(this.rebateAgents));
          }
        });
      }
  });
}

bindRebateAgents(){
      if(this.rebateAgents.length == 1)
      {
        this.rebateAgent = this.rebateAgents[0][this.rebateAgentsHeaders[1][1]]
        this.model.rebate_Agent_ID = this.rebateAgents[0][this.rebateAgentsHeaders[0][1]]
      }
      if(this.model.rebate_Agent_ID && this.rebateAgents.length > 0)
      {
        this.rebateAgent = this.rebateAgents.find( x => x.agent_id== this.model.rebate_Agent_ID).agent_name;
      }
}

populateCompanyLocations(){
  this.localStorageService.getData(`${this.model.booking_ID}:CompanyLocations`).subscribe((result) => {
    if(result &&  result!=='undefined'){
        this.companyLocations = JSON.parse(result);
        this.bindCompanyLocations();
    }else{
        this.billToService.getCompanyLocations().subscribe(response => {
        this.companyLocations = response;
        this.bindCompanyLocations();
        if(this.model.booking_ID && this.model.booking_ID != 0){
          this.localStorageService.saveData(`${this.model.booking_ID}:CompanyLocations`, JSON.stringify(this.companyLocations));
        }
      });
    }

  })
}

bindCompanyLocations(){
    if(this.companyLocations.length == 1)
    {
      this.companyLocation = this.companyLocations[0][this.companyLocationsheaders[1][1]]
      this.model.origin_Agent_ID = this.model.location_ID = this.companyLocations[0][this.companyLocationsheaders[0][1]]
    }
    if(this.model.origin_Agent_ID && this.companyLocations.length > 0)
    {
      const filterdData = this.companyLocations.find( x => x.locations_code== this.model.origin_Agent_ID);
      if(filterdData && filterdData.locations_name){
        this.companyLocation =  filterdData.locations_name;
    }
    }
}

populateBookingMethods(){
  this.localStorageService.getData(`${this.model.booking_ID}:BookingMethods`).subscribe((result) => {
    if(result && result!=='undefined'){
          this.bookingMethods = JSON.parse(result);
          this.bindBookingMethods();
    }else{
      this.billToService.getBookingMethods().subscribe(response =>
        {
          this.bookingMethods = response;
          this.bindBookingMethods();
        if(this.model.booking_ID && this.model.booking_ID != 0){
          this.localStorageService.saveData(`${this.model.booking_ID}:BookingMethods`, JSON.stringify(this.bookingMethods));
          }
        })
    }
  })

}

bindBookingMethods(){
  if(this.bookingMethods.length == 1)
    {
      this.bookingMethod = this.bookingMethods[0][this.bookingMethodsheaders[1][1]]
      this.model.booking_Method_ID = this.bookingMethods[0][this.bookingMethodsheaders[0][1]]
    }
    if(this.model.booking_Method_ID && this.bookingMethods.length > 0)
    {
      this.bookingMethod = this.bookingMethods.find( x => x.type== this.model.booking_Method_ID).description;
    }
}


validateAndSend(event) {
    if (event && event.tabIndex == 1) {
      if (this.inputTextComponent) {
          for (let inputText of this.inputTextComponent.toArray()) {
            if(!inputText.validateInputElement())
            {
              this.isValid = false
            }
          }
      }
      if (this.autopopulateInputText) {
        for (let autopopulate of this.autopopulateInputText.toArray()) {
          if(!autopopulate.validateInputElement())
          {
            this.isValid = false
          }
        }
      }
      if(this.dropDownGridComponents){
        for(let dropdown of this.dropDownGridComponents.toArray())
        {
          if(!dropdown.validateInputElement())
          {
            this.isValid = false;
          }
        }
      }
      //NOTE : CODE refactor pending
      if (this.isValid) {
            this.isMicrosoft();
            this.isIntel();
            if(this.isEditUrl){
              // this.saveEditDatatoLocalStorage();
              event.isValid = this.isValid;
              this.validateService.validateCompleted(event);
              return;
            }


            if(this.model.booking_ID == 0){
              this.model.created_By = this.authService.userId;
              this.model.created_Date = this.utilsService.getCurrentDate();
              this.bookingService.createBooking(this.model).subscribe( response => {
                    if(response && response.error)
                    {
                      alert('Error- customer/order');
                      return;
                    }

                    if(response.booking_ID != 0 && this.isMicrosoftModel || this.isIntelModel){
                      if(this.isMicrosoftModel && this.microsoftModel == null ) {this.microsoftModel =new BillToMicrosoftModel(); }
                      if(this.isIntelModel && this.intelModel == null ) {this.intelModel =new BillToIntelModel(); }
                      let speacialAccountData = this.isMicrosoftModel ? this.microsoftModel : this.intelModel;
                      speacialAccountData.created_by = this.authService.userId;
                      speacialAccountData.created_date = this.utilsService.getCurrentDate();
                      speacialAccountData.bookingID = response.booking_ID;
                      speacialAccountData.customerCode = response.customer_Code
                      this.bookingService.createSpecialAccount(speacialAccountData).subscribe( res => {
                        if(res && res.error)
                        {
                          alert('Error- specialaccounts/billing');
                          return;
                        }
                        this.localStorageService.saveData(`${response.booking_ID}:display_Flag`,this.selectedClient.display_Flag);
                        this.localStorageService.saveData(`${response.booking_ID}:customer_Type`,this.selectedClient.customer_Type);
                        this.localStorageService.saveData(`${this.model.booking_ID}:IntelLocations`, JSON.stringify(this.intelLocations));

                      });
                    }
                    ApplicationService.instance.booking_id = response.booking_ID ;
                    this.addDataToLocalStorage(response);
                    // this.validateService.validateCompleted({isValid: this.isValid, tabIndex:1});
                    this.localStorageService.saveTabStausData(`${response.booking_ID}:tabstatus`, [false, false, true, true])
                    event.isValid = this.isValid;
                    this.validateService.validateCompleted(event);
              });
            } else {
                  this.model.current_Editing_By = this.authService.userId;
                  this.bookingService.updateBooking(this.model).subscribe( response => {
                    if(response && response.error)
                    {
                      alert('Error- update customer/order');
                      return;
                    }
                    if(this.isMicrosoftModel || this.isIntelModel) {
                      let speacialAccountData = this.isMicrosoftModel ? this.microsoftModel : this.intelModel;
                      speacialAccountData.bookingID = response.booking_ID;
                      speacialAccountData.customerCode = response.customer_Code
                      speacialAccountData.modified_by = this.authService.userId
                      speacialAccountData.modified_date = this.utilsService.getCurrentDate();
                      this.billToService.getSpecialAccount(this.model.booking_ID).subscribe((res:any)=> {
                        if(res && res !== null) {
                          this.bookingService.updateSpecialAccount(speacialAccountData.bookingID, speacialAccountData).subscribe( res =>
                            {
                              if(res && res.error)
                            {
                              alert('Error- update specialaccounts/billing');
                              return;
                            }
                            this.localStorageService.saveData(`${this.model.booking_ID}:IntelLocations`, JSON.stringify(this.intelLocations));
                          });
                        } else {
                          this.bookingService.createSpecialAccount(speacialAccountData).subscribe( res => {
                            if(res && res.error){
                              alert('Error- create specialaccounts/billing');
                              return;
                            }
                            this.localStorageService.saveData(`${response.booking_ID}:display_Flag`,this.selectedClient.display_Flag);
                            this.localStorageService.saveData(`${response.booking_ID}:customer_Type`,this.selectedClient.customer_Type);
                            this.localStorageService.saveData(`${this.model.booking_ID}:IntelLocations`, JSON.stringify(this.intelLocations));
                            });
                        }
                      });
                    } else { //Delete Special Account if bilto is changed from special account to non-special account.
                      if(this.origClient && this.origClient.display_Flag =='1' && this.selectedClient.addr1 !== this.origClient.addr1 &&
                        (this.origClient.customer_Type ===  'Intel' || this.origClient.customer_Type ===  'Microsoft' ) ) {

                          this.billToService.getSpecialAccount(this.model.booking_ID).subscribe((res:any)=> {
                            if(res && res.special_account_id) {
                              this.billToService.deleteSpecialAccount(this.model.booking_ID).subscribe((result:any)=> {

                              });
                            }
                          });
                      }
                  }
                    ApplicationService.instance.booking_id = response.booking_ID ;
                    this.addDataToLocalStorage(response);
                    // this.localStorageService.saveData(`${response.booking_ID}:shoairbill_Number`, response.shoair_Bill_Number);
                    // this.localStorageService.saveData(`${response.booking_ID}:tariff_ID`, response.tariff_ID);
                    // this.localStorageService.saveData(`${response.booking_ID}:customer_Code`, response.customer_Code);
                    // this.localStorageService.saveData(`${response.booking_ID}:rebateAgents`, JSON.stringify(this.rebateAgents));
                    //// this.validateService.validateCompleted({isValid: this.isValid, tabIndex:1});
                    event.isValid = this.isValid;
                    this.validateService.validateCompleted(event);
                });
            }

          }
          this.isValid = true;
    }
  }
 /* saveEditDatatoLocalStorage(){
     this.model.current_Editing_By = this.authService.userId;
     this.localStorageService.saveData(`${this.model.booking_ID}:editBookingOrder`, JSON.stringify(this.model));
     this.localStorageService.saveData(`${this.model.booking_ID}:shoairbill_Number`,this.model.shoair_Bill_Number);
     this.localStorageService.saveData(`${this.model.booking_ID}:tariff_ID`, this.selectedClient.tariff_ID);
     this.localStorageService.saveData(`${this.model.booking_ID}:customer_Code`, this.selectedClient.customer_code);
     this.localStorageService.saveData(`${this.model.booking_ID}:rebateAgents`, JSON.stringify(this.rebateAgents));
     this.localStorageService.saveData(`${this.model.booking_ID}:CompanyLocations`, JSON.stringify(this.companyLocations))
     this.localStorageService.saveData(`${this.model.booking_ID}:BookingMethods`, JSON.stringify(this.bookingMethods))
     this.localStorageService.saveData(`${this.model.booking_ID}:BookingAgents`, JSON.stringify(this.bookingAgents))
     this.localStorageService.saveData(`${this.model.booking_ID}:CreditCardInfo`, JSON.stringify(this.creditCardInfos))
     this.localStorageService.saveData('ePay_Customer_Number', this.ePay_Customer_Number);

     if(this.isMicrosoftModel || this.isIntelModel) {
      const speacialAccountData = this.isMicrosoftModel ? this.microsoftModel : this.intelModel;
      speacialAccountData.bookingID = this.model.booking_ID;
      speacialAccountData.customerCode = this.model.customer_Code
      speacialAccountData.modified_by = this.authService.userId
      speacialAccountData.modified_date = this.utilsService.getCurrentDate();
      this.localStorageService.saveData(`${this.model.booking_ID}:editSpecialAccount`, JSON.stringify(speacialAccountData));
     } else {
      if(this.origClient && this.origClient.display_Flag =='1' && this.selectedClient.addr1 !== this.origClient.addr1 &&
      (this.origClient.customer_Type ===  'Intel' || this.origClient.customer_Type ===  'Microsoft' ) ) {
        this.localStorageService.saveData(`${this.model.booking_ID}:editSpecialAccount`, 'delete');
      }
     }
  }*/
  updateEditOrderCache() {
    if(this.isEditUrl) {
      this.localStorageService.saveData(`${this.model.booking_ID}:editBookingOrder`, JSON.stringify(this.model));
    }
  }

  addDataToLocalStorage(response:any){
            //this.localStorageService.saveData(`${response.booking_ID}:billto`, JSON.stringify(response));
            this.localStorageService.saveData(`${response.booking_ID}:bookingOrder`, JSON.stringify(response));
            this.localStorageService.saveData(`${response.booking_ID}:shoairbill_Number`, response.shoair_Bill_Number);
            this.localStorageService.saveData(`${response.booking_ID}:tariff_ID`, response.tariff_ID);
            this.localStorageService.saveData(`${response.booking_ID}:customer_Code`, response.customer_Code);
            this.localStorageService.saveData(`${response.booking_ID}:rebateAgents`, JSON.stringify(this.rebateAgents));
            this.localStorageService.saveData(`${response.booking_ID}:CompanyLocations`, JSON.stringify(this.companyLocations))
            this.localStorageService.saveData(`${response.booking_ID}:BookingMethods`, JSON.stringify(this.bookingMethods))
            this.localStorageService.saveData(`${response.booking_ID}:BookingAgents`, JSON.stringify(this.bookingAgents))
            this.localStorageService.saveData(`${response.booking_ID}:CreditCardInfo`, JSON.stringify(this.creditCardInfos))
            this.localStorageService.saveData('ePay_Customer_Number', this.ePay_Customer_Number);
  }

  bindModel(billToObj: any) {
      this.model.billTo_Name = billToObj.address_name;
      this.model.billTo_Address1 = billToObj.addr1;
      this.model.billTo_Address2 = billToObj.addr2;
      this.model.billTo_City = billToObj.addr_sort1;
      this.model.billTo_State = billToObj.addr_sort2;
      this.model.billTo_Zip = billToObj.addr_sort3;
      this.model.billTo_Attention = billToObj.attention_name;
      this.model.billTo_Email = billToObj.attention_email;
      this.model.billTo_Phone = billToObj.attention_phone;
      this.model.billTo_Fax = billToObj.billTo_Fax;
      this.model.customer_Code = billToObj.customer_code;
      this.model.payment_Type = billToObj.payment_code;
      this.model.tariff_ID = billToObj.tariff_ID;
      this.model.card_Type = '';
      this.model.card_Holder_Name = '';
      this.model.card_Number = '';
      this.model.card_Expiration_Date = '';
      this.model.card_Security_Code = '';
      this.model.card_Approval_No = '';
      this.model.booking_Agent_ID = '';

      if(!this.isEditUrl)
      {
        this.model.requestor_Name = '';
        this.model.rebate_Agent_ID = '';
        this.model.po_Number = '';
        this.model.booking_Method_ID = '';
        this.model.origin_Agent_ID = '';
        this.model.location_ID = '';
        this.model.shoair_Bill_Number = '';

      }
     // this.model.ePay_Customer_Number = billToObj.ePay_Customer_Number
  }

  ddBillToChangeHandler(event) {
    if (this.model.billTo_Name !== event[this.billToNameHeaders[1][1]]) {
      this.ddReset = true;
    }

    this.selectedClient = event;
    this.isMicrosoft();
    this.isIntel();
    this.bindModel(event);

    this.model.billTo_Name = this.selectedClient[this.billToNameHeaders[1][1]];
    this.populateBookingAgents(true);
    if (this.isIntelModel) {
      this.populateIntelLocations();
    }
    this.ePay_Customer_Number = event.ePay_Customer_Number
    this.localStorageService.saveData('ePay_Customer_Number', this.ePay_Customer_Number);
    if (this.isCreditCard()) {
      this.creditCardInfos = [];
      this.creditCardInfo = {};
      this.populateCreditCardInfo(true);
    }
    this.saveBilltoChangeinCache();
    this.saveSpecialOrderInCache();

  }


      populateCreditCardInfo(isCustomerCodeChange){

      // this.localStorageService.getData('ePay_Customer_Number').subscribe((result) => {
      //   if(result)
      //   {
      //     console.log('ePay_Customer_Number', result) ;
      //     this.ePay_Customer_Number = result;
          if(isCustomerCodeChange && this.ePay_Customer_Number != undefined  && this.ePay_Customer_Number != 'null'){
           // if(this.ePay_Customer_Number != 'undefined' && this.ePay_Customer_Number != 'null'){
                this.billToService.getCreditCardInfo(this.ePay_Customer_Number).subscribe((response:any)  => {
                  if(response.error){
                    return;
                  }
                  this.creditCardInfos = response;
                  this.bindCreditCardInfo();
                  //this.localStorageService.saveData(`${this.model.booking_ID}:CreditCardInfo`, JSON.stringify(this.creditCardInfos))
              });
          //  }
        }else{
            this.localStorageService.getData(`${this.model.booking_ID}:CreditCardInfo`).subscribe((result) => {
                if(result &&  result!=='undefined'){
                    this.creditCardInfos = JSON.parse(result);;
                    this.bindCreditCardInfo();
                }else if(this.ePay_Customer_Number != undefined && this.ePay_Customer_Number != 'null'){
                    this.billToService.getCreditCardInfo(this.ePay_Customer_Number).subscribe((response:any)  => {
                                this.creditCardInfos = response;
                                this.bindCreditCardInfo();
                            });
               }
           })
        }

        //}
      //})
    }


    bindCreditCardInfo(){
      if(this.creditCardInfos.length == 1)
          {
            this.creditCard = this.creditCardInfos[0][this.creditCardheaders[0][1]]
            this.model.card_Number = this.creditCardInfos[0][this.creditCardheaders[0][1]]
            this.creditCardInfo = this.creditCardInfos[0];
          }
          if(this.model.card_Number && this.creditCardInfos.length > 0)
          {
            this.creditCardInfo = this.creditCardInfos.find( x => x.card_number == this.model.card_Number);
          }
    }


    populateIntelLocations(){
      this.localStorageService.getData(`${this.model.booking_ID}:IntelLocations`).subscribe((result) => {
        if(result && result!=='undefined' ){
          this.intelLocations = JSON.parse(result);
          this.bindIntelLocations();
        }else{
          this.billToService.getIntelLocations().subscribe(response=>{
            this.intelLocations = response
            this.bindIntelLocations();
            if(this.model.booking_ID && this.model.booking_ID != 0){
              this.localStorageService.saveData(`${this.model.booking_ID}:IntelLocations`, JSON.stringify(this.intelLocations));
            }

          })
        }
      })
    }

    bindIntelLocations(){
      if(this.intelLocations.length == 1)
      {
        this.intelLocation = this.intelLocations[0][this.intelLocationsheaders[1][1]]
        this.intelModel.locationCode = this.intelLocations[0][this.intelLocationsheaders[0][1]]
      }
      if(this.intelModel.locationCode && this.intelLocations.length > 0)
      {
        this.intelLocation = this.intelLocations.find( x => x.locations_code== this.intelModel.locationCode).locations_name;
      }
    }

    populateBookingAgents(isCustomerCodeChange){
        if(isCustomerCodeChange){
          this.billToService.getBookingAgents(this.model.customer_Code).subscribe(response=>{
            this.bookingAgents = response;
            this.bindBookingAgents();
          });
        }
        else{
        this.localStorageService.getData(`${this.model.booking_ID}:BookingAgents`).subscribe((result) => {
          if(result && result!=='undefined'){
            this.bookingAgents = JSON.parse(result);
            this.bindBookingAgents();
          }else{
            this.billToService.getBookingAgents(this.model.customer_Code).subscribe(response=>{
              this.bookingAgents = response;
              this.bindBookingAgents();
            });
          }
        })
      }


    }

    bindBookingAgents(){
      if(this.bookingAgents.length == 1)
      {
        this.bookingAgent = this.bookingAgents[0][this.bookingAgentHeaders[1][1]]
        this.model.booking_Agent_ID = this.bookingAgents[0][this.bookingAgentHeaders[0][1]]
      }
      if(this.model.booking_Agent_ID && this.bookingAgents.length > 0)
      {
        this.bookingAgent = this.bookingAgents.find( x => x.agent_id== this.model.booking_Agent_ID).agent_name;
      }
      this.ddReset =false;
    }

    serchTextChangehandler(event) {
      if(event.trim() == "")
      {
        return;
      }
      if (this.searchTerms !== event ) {
        this.searchTerms = event ;
        this.billToService.search(event).subscribe((response:any) => {
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

    isMicrosoft(){
      if(this.selectedClient && this.selectedClient.display_Flag){
       this.isMicrosoftModel = this.selectedClient && this.selectedClient.display_Flag === "1" && this.selectedClient.customer_Type ===  'Microsoft';
      }
      else if(this.selectedClient && !this.selectedClient.display_Flag)
      {
        this.isMicrosoftModel = false;
      }
      else if(this.model.booking_ID != 0){
        this.localStorageService.getData(`${this.model.booking_ID}:display_Flag`).subscribe((result) => {
          if(result && result == "1"  )
          {
            this.localStorageService.getData(`${this.model.booking_ID}:customer_Type`).subscribe((result) => {
              this.isMicrosoftModel = (result && result == "Microsoft");
            })
          }
        })
      }
    }

    isIntel(){
      if(this.selectedClient && this.selectedClient.display_Flag){
       this.isIntelModel = this.selectedClient && this.selectedClient.display_Flag === "1" && this.selectedClient.customer_Type ===  'Intel';
      }

      else if(this.selectedClient && !this.selectedClient.display_Flag)
      {
        this.isIntelModel = false;
      }
      else if(this.model.booking_ID != 0){
        this.localStorageService.getData(`${this.model.booking_ID}:display_Flag`).subscribe((result) => {
          if(result && result == "1"  )
          {
            this.localStorageService.getData(`${this.model.booking_ID}:customer_Type`).subscribe((result) => {
              this.isIntelModel = (result && result == "Intel");
            })
          }
        })
      }
    }

    isCreditCard(){
      return this.model && this.creditCardTypes.includes(this.model.payment_Type);
    }

    displayCreditCardHandler(event){
      this.ccModel = new CreditCardInfo();
      this.displayCreditCardPop = true;
    }

    cancelCreditCardPopHandler(event){
      this.displayCreditCardPop = false;
    }

    saveCreditCardClickHandler(event){
      this.validateNewCreditCardFields();
      if(this.isCCValid){
        this.ccModel.expiration_mmyy = this.selectedMonth + "/" + this.selectedYear.substr(this.selectedYear.length -2);
        this.ccModel.epay_customer_number = this.ePay_Customer_Number;
        this.localStorageService.saveData(`${this.ccModel.epay_customer_number}:${this.ccModel.card_number.substr(this.ccModel.card_number -4)}:approvalNumber`, this.approvalNumber);

        this.billToService.saveCreditCardInfo(this.ccModel).subscribe((response:any)  => {
            if(response.error)
            {
              alert("Error- save customer/creditinfo/cards")
              return;
              }
            this.model.card_Approval_No = this.approvalNumber;
            this.model.card_Number = `XXXXXXXXXXXX${response.card_number.substr(response.card_number.length -4)}`;
            this.model.payment_Type = response.credit_card_type;
            this.populateCreditCardInfo(true)
            this.displayCreditCardPop = false;
        });
      }
      this.isCCValid = true;
    }

    validateNewCreditCardFields(){
      this.isCCValid = true;
      if (this.inputTextComponent) {
        for (let inputText of this.inputTextComponent.toArray()) {
          if(inputText.type == 'creditcard' && !inputText.validateInputElement())
          {
            this.isCCValid = false
          }
        }
      }
      if(this.dropDownGridComponents){
        for(let dropdown of this.dropDownGridComponents.toArray())
        {
          if(dropdown.isCreditCard && !dropdown.validateInputElement())
          {
            this.isCCValid = false;
          }
        }
      }
      if(this.dropDownComponent){
        for(let dropdown of this.dropDownComponent.toArray())
        {
          if(dropdown.isCreditCard &&  !dropdown.validateInputElement())
          {
            this.isCCValid = false;
          }
        }
      }
      if(this.zipCodeComponent){
        for(let zipcode of this.zipCodeComponent.toArray())
        {
          if(zipcode.isCreditCard  && !zipcode.validateInputElement())
          {
            this.isCCValid = false;
          }
        }
      }

      if (!this.ccModel.name || this.ccModel.name.trim().split(' ').length !== 2) {
        const dialogRef = this.dialogService.showInfoPopup(Messages.ERROR_TITLE,Messages.ENTER_VALID_NAME);
        this.isCCValid = false;
      }
    }

    creditCardTypeSelecthandler(event, key) {
      this.ccModel.credit_card_type = event[key];
    }

    /*------------DropDown Selecthandlers----------*/
    bookingagentSelecthandler(event, key) {
      this.model.booking_Agent_ID = event[key];
      this.updateEditOrderCache();
    }
    rebateAgentSelecthandler(event, key) {
      this.model.rebate_Agent_ID = event[key];
      this.updateEditOrderCache();
    }
    bookmethodeSelecthandler(event, key) {
      this.model.booking_Method_ID = event[key];
      this.updateEditOrderCache();
    }
    cmpLocationSelecthandler(event, key) {
      this.model.origin_Agent_ID = this.model.location_ID = event[key];
      this.updateEditOrderCache();
    }
    creditCardSelecthandler(event, key) {
      this.model.card_Number = event[key];
      this.creditCardInfo = event;
      this.updateEditOrderCache();
    }
    intelLocationSelecthandler(event, key) {
      this.intelModel.locationCode = event[key];
      this.saveSpecialOrderInCache();
    }
    zipCodeChangeHandler(event){
          this.model.billTo_Zip =  event;
          this.updateEditOrderCache();
    }

    monthChangeHandler(event){
      this.selectedMonth = event;
    }

    yearChangeHandler(event){
      this.selectedYear = event;
    }

    fillYears(){
      this.years = [];
        var currentYear = new Date().getFullYear(), years = [];
        let maxYear = 2039;
        for(let i = 0; i <= 20; i++ )
        {
            this.years.push(currentYear + i);
        }

    }
    changeModel(event: any,key:any) {
      this.model[key] = event;
      this.updateEditOrderCache();
    }
    cardExpirationDateChange(event) {
      this.model.card_Expiration_Date = this.model.card_Expiration_Date + '/' + event;
      this.updateEditOrderCache();
    }
    changeIntelmodel(event,key) {
      this.intelModel[key] = event;
      this.saveSpecialOrderInCache();
    }
    changeIntelNotes(event) {
      if(this.intelModel){
        this.intelModel.notes = event;
      }      
      this.saveSpecialOrderInCache();
    }
    changeMicrosoftmodel(event,key) {
      this.microsoftModel[key] = event;
      this.saveSpecialOrderInCache();
    }
    changeInmicrosoftNotes(event) {
      if(this.microsoftModel.notes){
        this.microsoftModel.notes = event ;
      }
      this.microsoftModel.notes = event;
      this.saveSpecialOrderInCache();
    }
    saveSpecialOrderInCache() {
      if(this.isEditUrl) {
        if(this.isMicrosoftModel || this.isIntelModel) {
          const speacialAccountData = this.isMicrosoftModel ? this.microsoftModel : this.intelModel;
          speacialAccountData.bookingID = this.model.booking_ID;
          speacialAccountData.customerCode = this.model.customer_Code
          speacialAccountData.modified_by = this.authService.userId
          speacialAccountData.modified_date = this.utilsService.getCurrentDate();
          this.localStorageService.saveData(`${this.model.booking_ID}:editSpecialAccount`, JSON.stringify(speacialAccountData));
         } else {
          if(this.origClient && this.origClient.display_Flag =='1' && this.selectedClient.addr1 !== this.origClient.addr1 &&
          (this.origClient.customer_Type ===  'Intel' || this.origClient.customer_Type ===  'Microsoft' ) ) {
            this.localStorageService.saveData(`${this.model.booking_ID}:editSpecialAccount`, 'delete');
          }
         }
      }
    }
    saveBilltoChangeinCache() {
      if(this.isEditUrl) {
      this.model.service_Level_Code = null;
      this.localStorageService.saveData(`${this.model.booking_ID}:display_Flag`,this.selectedClient.display_Flag);
      this.localStorageService.saveData(`${this.model.booking_ID}:customer_Type`,this.selectedClient.customer_Type);
      this.localStorageService.saveData(`${this.model.booking_ID}:shoairbill_Number`,this.model.shoair_Bill_Number);
      this.localStorageService.saveData(`${this.model.booking_ID}:tariff_ID`, this.selectedClient.tariff_ID);
      this.localStorageService.saveData(`${this.model.booking_ID}:customer_Code`, this.selectedClient.customer_code);
      this.localStorageService.saveData(`${this.model.booking_ID}:editBookingOrder`, JSON.stringify(this.model));
    }
    }

}
