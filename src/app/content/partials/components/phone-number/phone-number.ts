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
  selector: 'app-phone-number',
  styleUrls: ['phone-number.scss'],
  templateUrl: 'phone-number.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PhoneNumberComponent implements OnInit, OnChanges{

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
  @Input() value?: string;
  @Input() tabindex: number ;
  @Input() isEditMode:boolean;
  @Input() jsonField?:string;
  @ViewChild('ipElement', {static: false}) ipEl: any;
  @Output() modelChange: EventEmitter<string>  = new EventEmitter();
  private mobileFormat =  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  private regex = /[^\d)(--\s]/ig;


  constructor(private validateService:ValidateService,
    private rulesService: BusinessRulesService) {
  }

  ngOnInit(){}

  public iptextChangehandler(event) {
    const value: any = event.target.value;
    this.ipEl.nativeElement.value =  value.replace(this.regex, '');
    this.modelChange.emit(this.ipEl.nativeElement.value);
 }

  public textChange(event){
      const value =  this.ipEl.nativeElement.value ;
      if (value != '' && this.type === 'mobile' || this.type === 'fax'  && value.length === 10) {
        if (value.match(this.mobileFormat)) {
          this.ipEl.nativeElement.value  = this.mobileFormatting(value);
          this.highlight('#8f9bb3');
          this.modelChange.emit(value);
          return true;
          } else {
            this.highlight('#fa0404');
            return false;
      }
      }

  }
  public focusOutFunction(event) {
    let value = event.target.value;
    const required = event.target.required;
    return this.validateTextFields(value, required);
  }

  private highlight(color: string) {
      this.ipEl.nativeElement.style.borderColor = color;
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
    let response:Boolean =true;
    switch (this.type) {
      case 'mobile':
      case 'fax':
        if(value ==''){
            if(required){
                this.highlight('#fa0404');
                response =false ;
            } else{ this.highlight('#8f9bb3'); }         
        }else if (value != '' && value.match(this.mobileFormat)) {
           this.highlight('#8f9bb3');
           response = true;
        } else {
           this.highlight('#fa0404');
            response = false;
        }
      break;
    }
    return response;
  }
 /* validateTextFields(value:any , required: boolean){
    let response:Boolean;
    switch (this.type) {
      case 'mobile':
      case 'fax':
        if (value == '' || value.match(this.mobileFormat)) {
           this.highlight('#8f9bb3');
           response = true;
        } else {
          if (required) {  this.highlight('#fa0404');}
          response = false;
        }
      break;
    }
    return response;
  }*/
  private mobileFormatting(tel) {
    if (!tel) { return; }
    const value = tel.toString().trim().replace(/^\+/, '');
    if (value.match(/[^0-9]/)) {
        return tel;
    }
    let country, city, number;

    switch (value.length) {
        case 10: // +1PPP####### -> C (PPP) ###-####
            country = 1;
            city = value.slice(0, 3);
            number = value.slice(3);
            break;

        case 11: // +CPPP####### -> CCC (PP) ###-####
            country = value[0];
            city = value.slice(1, 4);
            number = value.slice(4);
            break;

        case 12: // +CCCPP####### -> CCC (PP) ###-####
            country = value.slice(0, 3);
            city = value.slice(3, 5);
            number = value.slice(5);
            break;

        default:
            return tel;
    }

    if (country === 1) {
        country = '';
    }

    number = number.slice(0, 3) + '-' + number.slice(3);
    return (country + " (" + city + ") " + number).trim();

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
