import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import {OperationsService} from '../../../../../../services/operation.service'
import AuthService from 'src/app/services/auth.service';
import { CarrierModel } from 'src/app/core/models/carrier.model';
import { LoaderService } from 'src/app/services/loader.service';
import { UtilsService } from 'src/app/services/Utils.service';
import { InputTextComponent } from 'src/app/content/partials/components/inputtext/inputtext.component';
import { DropdownGridComponent } from 'src/app/content/partials/components/dropdown-grid/dropdown-grid.component';
import { Messages } from 'src/app/common/Messages';
import * as _ from 'lodash';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-carriers',
  templateUrl: './carriers.component.html',
  styleUrls: ['./carriers.component.scss']
})
export class CarriersComponent implements OnInit {

  @ViewChildren(InputTextComponent) inputTextComponent: QueryList<InputTextComponent>;
  @ViewChildren(DropdownGridComponent) dropdownGridComponent: QueryList<DropdownGridComponent>;

  public operationModel:any;
  public ddServiceLevelsHeaders:any[] =[["Code","service_level_code"],["Description","service_level_description"]];
  public ddServiceLevels: any[];

  public ddCarrierCodes:any[]= [];
  public ddCarrierCodesHeaders:any[] =[["Code","carrier_code"], ["Type","carrier_type"], ["Name","carrier_name"]];

  public carrierCodeValue:any;
  public serviceLevelValue:any;

  public arrCarriers:any[]=[];
  public carrierServiceLevels:any=[];
  public isRowDeleted: boolean;
  
  authService:any;
  previousUrl:string;
  carrierModel: CarrierModel;
  carriersData: any[] = [];
  private compareCarriersData: any[] = [];
  selectedRowIndex: any;
  isUpdate: boolean = false;
  ddReset:boolean = false;
  ddReset1:boolean = false;
  
  constructor( private localStorageService: LocalStorageService,
               private router:Router,
               private operationService:OperationsService,
               private dialogService : DialogService,
               private utilsService : UtilsService) {
                this.carriersData = [];
                this.authService = AuthService.getInstance();
                if(this.authService.hasToken){
                  this.localStorageService.getData(`${ApplicationService.instance.order_id}:operation_order`).subscribe((result) =>
                  {
                    if(result)
                    {
                      this.operationModel = JSON.parse(result);
                      this.getCarriers();
                      this.getCarrierCodes();
                      //this.getCarrierServiceLevels();
                    }
                  })
                  this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`)
                }else{
                  this.router.navigateByUrl("login");
                }
                this.initializeModel();
               }

  ngOnInit() {
  }

  getCarrierCodes(){
    this.operationService.getCarrierCodes().subscribe((result:any)=>{
       this.ddCarrierCodes = result.filter(item => item.carrier_code != null && item.carrier_code != ' ' && item.carrier_code != '' && item.carrier_code != '...'  );
    });
  }
  getCarriers(){
    this.operationService.getCarriers(this.operationModel.order_ID).subscribe((response:any)=>{
       if(response.error){
         alert('Error - get orders/${orderId}/carriers');
       }
      this.carriersData = response.carriers ;
      this.compareCarriersData = Object.assign([], response.carriers);   
     });

  }

  getCarrierServiceLevels(tariff_ID:any){
    this.operationService.getCarrierServiceLevels(tariff_ID).subscribe((response:any)=>{
      if(response.error){
        alert('Error - get utilities/carrierservicelevels');
      }
      this.ddServiceLevels = response.filter(item=> item.service_level_description!="..." &&  item.service_level_code!= "...");
   });
  }

  ddServiceLevelSelecthandler(event, key) {
    this.carrierModel.carrierServiceLevelCode = event.service_level_code;
    this.carrierModel.currentStatus = event.status;
    this.carrierModel.fuelSurchargeCost = event.fuel_surcharge_cost;
    this.carrierModel.fuelSurchargeType = event.fuel_surcharge_type;
    this.carrierModel.segmentCode = event.segment_code;
    this.carrierModel.serviceLevelId = event.service_level_id;
    
  }

  ddCarrierCodeSelecthandler(event, key){
    console.log('ddCarrierCodeSelecthandler  ', event,key);  
    this.resetServiceDropDown();
    this.carrierModel.carrierCode = event.carrier_code;
    this.carrierModel.carrierName = event.carrier_name;
    this.carrierModel.tariffId = event.tariff_id;   
    this.getCarrierServiceLevels(event.tariff_id);  
  }

  resetServiceDropDown(){
      const owner = this;
      owner.ddReset1 = false;
      setTimeout(()=>{
        owner.ddReset1 = true;
      },10);  
  }

  resetCarrierDropDown(){
      const owner = this;
      owner.ddReset = false;
      setTimeout(()=>{
        owner.ddReset = true;    
      },10);  
  }

   updateItemHandler(event) {
    //this.carrierModel.statusCode = (this.carrierModel.statusCode && this.carrierModel.statusCode !== 'I') ? 'U' : 'I';
    if (!this.validateIPElements()) {
      return ;
    }

    const carriersData:any = this.carriersData.filter(item=> item.routingId != this.carrierModel.routingId);
    if(this.isCarrierCodeUsed(carriersData,this.carrierModel.carrierCode)){
      this.dialogService.showInfoPopup(Messages.WARNING_TITLE, Messages.CARRIER_CODE_IN_USE);
      return ;
    }
  
    if(this.carrierModel.statusCode && this.carrierModel.statusCode === 'I'){
        this.carrierModel.statusCode = 'I';
    }else {
        this.carrierModel.statusCode = 'U';
    }

    if(this.carrierModel.statusCode && this.carrierModel.statusCode == 'I'){
      this.carrierModel.createdBy = AuthService.getInstance().userId;
    }
    else{
      this.carrierModel.modifiedBy = AuthService.getInstance().userId;
      this.carrierModel.modifiedDate = this.utilsService.getCurrentDate();
    }

    this.carriersData[this.selectedRowIndex] =  this.carrierModel;
    this.initializeModel();
    this.isUpdate = false;
    this.resetCarrierDropDown();
    this.resetServiceDropDown();

   }

   addItemHandler(event){
    if (!this.validateIPElements()) {
      return ;
    }
     if(this.isCarrierCodeUsed(this.carriersData,this.carrierModel.carrierCode)){
      this.dialogService.showInfoPopup(Messages.WARNING_TITLE, Messages.CARRIER_CODE_IN_USE);
      return ;
    }
   /* const carrierServiceLevel = this.ddServiceLevels.filter(item =>  item.carrier_code == this.carrierModel.carrierCode 
                                                                                && item.service_level_code == this.carrierModel.carrierServiceLevelCode);*/
    this.carrierModel.itemIndex = this.carriersData.length;
    this.carrierModel.statusCode = 'I';
    this.carrierModel.createdBy = AuthService.getInstance().userId;
    this.carrierModel.consolidated = this.operationModel.consolidation;
    this.carrierModel.consolidatedType = (this.operationModel.consolidation_Type!=="" &&this.operationModel.consolidation_Type!== null )? this.operationModel.consolidation_Type:'N';
    this.carrierModel.createdDate = this.utilsService.getCurrentDate();
    //this.carrierModel.currentStatus = carrierServiceLevel[0].status;
    this.carrierModel.declaredValueCost = this.operationModel.declared_Value;
    //this.carrierModel.fuelSurchargeCost = carrierServiceLevel[0].fuel_surcharge_cost;
    //this.carrierModel.fuelSurchargeType = carrierServiceLevel[0].fuel_surcharge_type;
    this.carrierModel.orderId = this.operationModel.order_ID;
    //this.carrierModel.segmentCode = carrierServiceLevel[0].segment_code;
    //this.carrierModel.serviceLevelId = carrierServiceLevel[0].service_level_id;
    //this.carrierModel.tariffId = this.operationModel.tariff_ID;   

    this.carriersData.push(this.carrierModel);
    console.log('this.model  ', this.carrierModel);
    this.initializeModel(); // resetting ;
    this.resetCarrierDropDown();
    this.resetServiceDropDown();
   }

   editItemClickHandler(row,index){
    this.carrierModel = null;
    this.carrierModel = Object.assign({}, row) ;
    this.isUpdate = true;
    this.selectedRowIndex = index ;
    this.carrierCodeValue = this.ddCarrierCodes.find(item =>  item.carrier_code == this.carrierModel.carrierCode).carrier_name ;    
    this.operationService.getCarrierServiceLevels(this.carrierModel.tariffId).subscribe((response:any)=>{
      if(response.error){
        alert('Error - get utilities/carrierservicelevels');
      }      
     // this.ddServiceLevels = response;
      this.ddServiceLevels = response.filter(item=> item.service_level_description!="..." &&  item.service_level_code!= "...");
      const serviceLevel = response.find(item =>  item.service_level_code == this.carrierModel.carrierServiceLevelCode) ;
      if(serviceLevel){
         this.serviceLevelValue = serviceLevel.service_level_description;
         console.log('this.ddServiceLevels  ',this.ddServiceLevels);
         console.log('this.serviceLevelValue  ',this.serviceLevelValue);
      }
     
    });
   // this.serviceLevelValue = this.ddServiceLevels.find(item =>  item.service_level_code == this.carrierModel.carrierServiceLevelCode) ;   
    
    console.log('editRow  ', this.carrierModel);
    this.ddReset = false;
   }

   deleteRow(row, index) {
      this.dialogService.showConfirmationPopup(Messages.DELETE_TITLE, Messages.CONFIRM_DELETE_ROW)
        .afterClosed().subscribe(result => {
        if (result && result.clickedOkay) {
          this.isRowDeleted = true;
          if (row.statusCode && row.statusCode === 'I') {
            this.carriersData.splice(row.itemIndex , 1);
            let i = 0;
            for(let item of this.carriersData){
              item.itemIndex = i++;
            }
          } else {
            row.statusCode = 'D';
            row.deleted_By =  AuthService.getInstance().userId;
          }
          this.initializeModel();
          }
        });
       // this.ddReset = true;
       // this.resetServiceDropDown();
    }

    initializeModel(){
      this.carrierModel = new CarrierModel();
      this.carrierModel.origin = this.operationModel.origin_Air_Code;
      this.carrierModel.destination = this.operationModel.dest_Air_Code;
      this.carrierModel.pieces = this.operationModel.pieces;
      this.carrierModel.declared_Value = this.operationModel.declared_Value;
      this.carrierModel.weight_Actual_LB = this.operationModel.weight_Actual_LB;
      this.carrierModel.weight_Dimensional_LB = this.operationModel.weight_Dimensional_LB;
    }

   closeBtnClickHandler(event){
     const prevUrl = `operations/airline/${ApplicationService.instance.order_id}`;
     if(this.isDirty()) {
       this.dialogService.showConfirmationPopup(Messages.CONFIRM_TITLE, Messages.SAVE_CHANGES)
        .afterClosed().subscribe(result => {
          if (result && result.clickedOkay) {
            this.saveBtnClickHandler(event);
          }
          else {
            this.router.navigateByUrl(prevUrl);
          }
        });
     }
     else {
      this.router.navigateByUrl(prevUrl);
     }
   }

   saveBtnClickHandler(event){
    this.isRowDeleted = false;
     //  this.router.navigateByUrl(`operations/airline/${ApplicationService.instance.order_id}`);
    LoaderService.instance.show();
    const filteredCarriersData = this.carriersData.filter(element => element.statusCode ==='I' || element.statusCode ==='D' || element.statusCode ==='U'   );
    for(let item of filteredCarriersData){
      delete item.itemIndex;
      delete item.origin;
      delete item.destination;
      delete item.pieces;
      delete item.weight_Actual_LB;
      delete item.weight_Dimensional_LB;
      delete item.declared_Value;
    }

    for(var index in filteredCarriersData){
      filteredCarriersData[index]['consolidatedType'] = (this.operationModel.consolidation_Type!=="" &&this.operationModel.consolidation_Type!== null )? this.operationModel.consolidation_Type:'N';
    }

    this.operationService.saveCarriersData({"carriers" : filteredCarriersData}).subscribe((response: any) => {
      LoaderService.instance.close();
      if(response.error){
        alert('Error - save orders/carriers')
        return false;
      }     
     /* let carriersFromLS:any = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:carriers`);
       carriersFromLS = (carriersFromLS)? JSON.parse(carriersFromLS).carriers:[];
      if(carriersFromLS && carriersFromLS.length>0){       
        carriersFromLS = {carriers: carriersFromLS.concat(response.carriers)} ;
        this.localStorageService.saveData(`${ApplicationService.instance.order_id}:carriers`,JSON.stringify(carriersFromLS));
      }else{
        this.localStorageService.saveData(`${ApplicationService.instance.order_id}:carriers`,JSON.stringify(response));
      } */    
      this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
      this.router.navigateByUrl(this.previousUrl);
    });
   }

   isFormValid(){
       
   }

   validateIPElements() {
    let isFormValid : boolean = true;
    if (this.dropdownGridComponent) {
      for (let dropdown of this.dropdownGridComponent.toArray()) {
        if (!dropdown.validateInputElement())  {
          isFormValid = false;
        }
      }
    }
    if (this.inputTextComponent) {
      for (let textBox of this.inputTextComponent.toArray()) {
        if (!textBox.validateInputElement()) {
          isFormValid = false;
        }
      }
    }
    return isFormValid;
  }

   airBillChangehandler(event){
      this.carrierModel.airBillNumber = event;
   }

   hawbChangehandler(event){
      this.carrierModel.hawbNumber = event;
   }

   isCarrierCodeUsed(carriersData:any, carrierCode:any){
     if(carriersData && carriersData.length > 0){
          const found:any = carriersData.find(item=> item.carrierCode == carrierCode);
          if(found){
            return true;
          }
        }
       return false;
    }

   private isDirty(): boolean {
     return !_.isEqual(this.carriersData, this.compareCarriersData) || this.isRowDeleted;
   }

}
