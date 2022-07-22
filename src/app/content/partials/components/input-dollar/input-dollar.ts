import {
  Component,
  OnInit,
  Input,
  HostBinding,
  OnDestroy,
  Output,
  ViewEncapsulation,
  HostListener,
  ViewChild,
  OnChanges,
  EventEmitter,
  SimpleChanges,
  ChangeDetectionStrategy} from '@angular/core';
import { Element } from '@angular/compiler';
import {ValidateService} from '../../../../services/validate.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';




@Component({
  selector: 'app-input-dollar',
  styleUrls: ['input-dollar.scss'],
  templateUrl: 'input-dollar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DollarInputComponent implements OnInit, OnChanges{

  @Input() type: string; // text,email,mobile,number,zip
  @Input() model: string;
  @Input() pipe?: string;
  @Input() class?: string;
  @Input() placeHolder?: string;
  @Input() width?: string;
  @Input() required?: boolean;
  @Input() readonly?: boolean;
  @Input() submitted?: boolean;
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() value?: any;
  @Input() tabindex: number ;
  @Input() isEditMode : boolean;
  @Input() jsonField?: string;
  @ViewChild('ipElement', {static: false}) ipEl: any;
  @Output() modelChange: EventEmitter<string>  = new EventEmitter();
  private mobileFormat =  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;



  constructor(private validateService:ValidateService,
      private rulesService: BusinessRulesService) {
  }

  ngOnInit(){}

  public textChange(event) {
     // const value =  this.ipEl.nativeElement.value ;
     const num = event.replace(/[$,]/g, "");
     this.modelChange.emit(num);
     return Number(num);

  }
  public focusOutFunction(event) {    
    let value = event.target.value;
     value = value.replace(/[$,]/g, "");
    if(value.replace(/[.]/g, "").match(this.mobileFormat)){
      this.modelChange.emit(value);
     }
    const required = this.required;
     return this.validateTextFields(value, required);
  }

  private highlight(color: string) {
    if( this.ipEl  &&  this.ipEl.nativeElement) {
      this.ipEl.nativeElement.style.borderColor = color;
    }

  }


  ngOnChanges(changes: SimpleChanges)
  {
    if(changes && changes.value &&   changes.value.currentValue !== undefined && changes.value.currentValue !==  changes.value.previousValue ) {
      this.modelChange.emit(changes.value.currentValue);
    }
  }

  validateInputElement(){
    return this.validateTextFields(this.ipEl.nativeElement.value, this.ipEl.nativeElement.required)
  }

  validateTextFields(value:any , required: boolean){
    let response:Boolean;
    value = value.replace(/[$,0.]/g, "")
    if (required && value.length < 1 ) {
      this.highlight('#fa0404');
      response = false;
  } else
  {
    this.highlight('#8f9bb3');
    response = true;
  }    
   return response;
  }

  public isEditable() {
    if(this.readonly) {
      return false;
    }
    if(this.isEditMode && !this.readonly && this.jsonField) {
      return this.rulesService.shouldEditable(this.jsonField);
    }
    return this.isEditMode !== undefined ? this.isEditMode : true;
  }

}
