import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation,
  ViewChildren, QueryList, EventEmitter, OnChanges, SimpleChanges,ChangeDetectionStrategy} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {InputTextComponent} from '../../../../../partials/components/inputtext/inputtext.component';
import {DropdownGridComponent} from '../../../../../partials/components/dropdown-grid/dropdown-grid.component';
import {ApplicationService} from '../../../../../../services/application.service';
import { OrigindestinationFreightService } from 'src/app/services/origin-destination-freight.service';
import AuthService from 'src/app/services/auth.service';
import { DollarInputComponent } from 'src/app/content/partials/components/input-dollar/input-dollar';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-freight',
  templateUrl: './freight.component.html',
  styleUrls: ['./freight.component.scss'],
  encapsulation: ViewEncapsulation.None,   
})
export class FreightComponent implements OnInit, OnDestroy, OnChanges {
serviceLevelValue:string = '';

@Input() ddServiceLevels: any[];
public ddServiceLevelsHeaders:any[] =[["ID","id"],["Code","code"],["Description","description"]];

private isValid:Boolean = false;
actualaWeightKG:any;
errorMessage:any;
ddReset:boolean;
txtAreaValid:boolean;

@ViewChildren(InputTextComponent) inputTextChildren :QueryList<InputTextComponent>;
@ViewChildren(DollarInputComponent) dollarInputComponent :QueryList<DollarInputComponent>;
@ViewChildren(DropdownGridComponent) dropDownComponents: QueryList<DropdownGridComponent>;
@Input() action = '';
@Input() isEditMode?:boolean;
@Input() freightModel: any;
@Input() isEditUrl:any;
//@Input() tariffID:any;
@Output() freightModelChange: EventEmitter <any> = new EventEmitter();
@Output() calcDimensionClick: EventEmitter <any> = new EventEmitter();
@Output() viewDimensionClick: EventEmitter <any> = new EventEmitter();



constructor(private router: Router,
            private odfService: OrigindestinationFreightService,
            private localStorageService: LocalStorageService,
            private rulesService:BusinessRulesService
            ) {

}

ngOnInit(): void {
  this.txtAreaValid = true;
    // setTimeout(() => {
    //   this.getServiceLevels();
    // }, 3000);
}

ngOnChanges(changes:SimpleChanges) {
  if(changes && changes.ddServiceLevels && changes.ddServiceLevels.currentValue  && changes.ddServiceLevels.currentValue !=  changes.ddServiceLevels.previousValue)
  {
    //this.getServiceLevels();
    this.bindServicelevels();
  }
}

ngOnDestroy(): void {

}

/*async getServiceLevels() {

  this.odfService.getServiceLevels(this.tariffID).subscribe(response => {
    this.ddServiceLevels  = response;
    if(this.freightModel.service_Level_Code && this.ddServiceLevels.length > 0)
      {
        this.serviceLevelValue = this.ddServiceLevels.find( x => x.code == this.freightModel.service_Level_Code).description;
      }
 });
}*/
bindServicelevels() {
  if(this.freightModel.service_Level_Code && this.ddServiceLevels.length > 0)
  {
    const serviceLevel = this.ddServiceLevels.find( x => x.code == this.freightModel.service_Level_Code);
    if (serviceLevel && serviceLevel.description) {
      this.serviceLevelValue = serviceLevel.description;
    }
   // this.serviceLevelValue = this.ddServiceLevels.find( x => x.code == this.freightModel.service_Level_Code).description;
  }
}

validateData(){
  this.errorMessage = "";
  let isDataValid = true;
  if(this.freightModel.pieces < 1)
  {
    this.errorMessage += "Pieces must be greater than 0. <br>";
    isDataValid = false
  }
  if(this.freightModel.weight_Actual_LB < 1)
  {
    this.errorMessage += "Actual weight(LBS) must be greater than 0. <br>";
    isDataValid = false
  }
  return isDataValid;
}


validateInputElement(){
  this.isValid = true;
  if(this.inputTextChildren){
      for(let inputText of this.inputTextChildren.toArray())
      {
        if(!inputText.validateInputElement())
        {this.isValid = false;}
      }
  }
  if(this.dollarInputComponent){
    for(let dollarText of this.dollarInputComponent.toArray())
    {
      if(!dollarText.validateInputElement())
      {this.isValid = false;}
    }
}
  if(this.dropDownComponents){
    for(let dropdown of this.dropDownComponents.toArray())
    {
      if(!dropdown.validateInputElement())
      {
        this.isValid = false;
      }
    }
  }
  if(this.freightModel.pieces_Description === null || this.freightModel.pieces_Description === undefined || this.freightModel.pieces_Description === '' )
  {
    this.txtAreaValid = false;
    this.isValid = false;
  }
  else{
    this.txtAreaValid = true;
  }
  // if(!this.validateData()){
  //   this.isValid = false;
  // }
  return this.isValid;
}

ddServiceLevelSelecthandler(event, key) {
 /* this.serviceLevelValue = event.value == 'select' ? "" : event.value;
  this.freightModel.service_Level_Code = this.serviceLevelValue ;
  this.emitEvent();*/
  if (this.freightModel) {
     // this.serviceLevelValue =  event[key];
      this.freightModel.service_Level_Code =   event[key];
      this.emitEvent();
  }

}
gotoCalculateDiamension($event){
  ApplicationService.instance.routerLink = this.router.url;
  this.calcDimensionClick.emit('calculatediamensions')
}

gotoViewDimension(event){
  ApplicationService.instance.routerLink = this.router.url;
  this.viewDimensionClick.emit('viewdimensions');
}

piecesChangehandler(event) {
  if (this.freightModel) {
    this.freightModel.pieces = event;
    this.localStorageService.saveData(`${this.freightModel.booking_ID}:pieces`, this.freightModel.pieces);
    this.emitEvent();
  }


}
actualaWeightLBSChangehandler(event){
  if (this.freightModel) {
    this.freightModel.weight_Actual_LB = Number(event);
    this.emitEvent();
  }
}
actualaWeightKGChangehandler(event){
  if (this.freightModel) {
    this.freightModel.weight_Actual_KG = Number(event);
  }
}
corporateAccoutChangehandler(event){
  if (this.freightModel) {
   // this.freightModel.weight_Actual_KG = event;
  }
}
seviceLevelChangehandler(event){
  if (this.freightModel) {
     this.freightModel.service_Level_Code = event;
     this.emitEvent();
   }
}
declaredValueChangehandler(event){
  if (this.freightModel) {
    this.freightModel.declared_Value = event;
    this.emitEvent();
  }
}
DIMWeightLBSChangehandler(event){
  if (this.freightModel) {
    this.freightModel.weight_Dimensional_LB = event;
    this.emitEvent();
  }
}
DIMWeightKGChangehandler(event) {
  if (this.freightModel) {
    this.freightModel.weight_Dimensional_KG = event;
    this.emitEvent();
  }
}
FreighDescriptionChange(event){
  if (this.freightModel) {
    this.freightModel.pieces_Description = event;
    this.txtAreaValid = true;
    this.emitEvent();
  }
}

focusOutHandler(event){
  if (this.freightModel) {
  this.freightModel.weight_Actual_KG = (Number(event) / 2.20462).toFixed(2);;
  }
  // this.actualaWeightKG

}

emitEvent() {
  this.freightModelChange.emit(this.freightModel);
}

}
