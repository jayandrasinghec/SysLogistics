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
import {UtilsService} from '../../../../services/Utils.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';



@Component({
  selector: 'app-input-text',
  styleUrls: ['inputtext.component.scss'],
  templateUrl: 'inputtext.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class InputTextComponent implements OnInit, OnChanges{

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
  @Input() valueType: string;
  @Input() isEditMode : boolean;
  @Input() setFocus?: any;
  @Input() jsonField?: string;
  @ViewChild('ipElement', {static: false}) ipEl: any;
  @Output() modelChange: EventEmitter<string>  = new EventEmitter();
  @Output() focusOutEvent: EventEmitter<string>  = new EventEmitter();

  private mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  private mobileFormat =  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  private zipCodeFormat = /^\d{5}$|^\d{5}-\d{4}$/;
  private timeFormat = /^([01]\d|2[0-3])([0-5]\d)$/;
  private numberWithDecimalRegex = /[^\d.-]/ig;

  constructor(private validateService:ValidateService,
      private utilsService:UtilsService,
      private rulesService: BusinessRulesService) {
  }

  ngOnInit(){
    //this.validateService.validateComponentEvent.subscribe(event => this.validateInputElement(event))
  }





  @HostListener('input', ['$event.target.value'])
  onInput(value) {
          if (this.type == 'email' && value.length === 10) {
              if (value.match(this.mailformat)) {
                   this.highlight('#8f9bb3');
                   return true;
                  } else {
                    this.highlight('#fa0404');
                    return false;
              }
          }          
  }

  public textChange(event){    
      let value =  this.ipEl.nativeElement.value ;
      if (this.type == 'mobile' && value.length === 10) {
        if (value.match(this.mobileFormat)) {
            this.ipEl.nativeElement.value  = this.mobileFormatting(value);
            this.highlight('#8f9bb3');
            return true;
            } else {
              this.highlight('#fa0404');
              return false;
        }
      }
      if (this.type == 'number') {
        value =  value.replace(this.numberWithDecimalRegex, '');
    }
      
      this.modelChange.emit(value);
  }
  
  public focusOutFunction(event) {
    let value = event.target.value;
    const required = event.target.required;
    if(this.valueType=='time'){
     event.target.value =  value = this.utilsService.formatTimeInput(value); 
     this.modelChange.emit(value);
    }
    this.focusOutEvent.emit(value);
    return this.validateTextFields(value, required);
  }

  private highlight(color: string) {
    if (this.ipEl){
      this.ipEl.nativeElement.style.borderColor = color;
    }
  }


  ngOnChanges(changes: SimpleChanges)
  {
     if(changes && changes.valueType &&   changes.valueType.currentValue !== undefined && changes.valueType.currentValue == 'time' )
     {
       if(this.value){
        this.value = this.utilsService.formatTimeInput(this.value); 
        this.modelChange.emit(this.value);
       }       
     }
    if(changes && changes.value &&   changes.value.currentValue !== undefined && changes.value.currentValue !==  changes.value.previousValue ) {
       if(this.value && this.valueType && this.valueType =='time'){
        this.value = this.utilsService.formatTimeInput(this.value); 
       }       
      this.modelChange.emit(changes.value.currentValue);
      this.highlight('#8f9bb3');
    }    
    if (changes.hasOwnProperty(`setFocus`) &&
    changes[`setFocus`][`currentValue`] !== undefined &&
    changes[`setFocus`][`currentValue`] === true && this.ipEl && this.isEditMode) {
      this.ipEl.nativeElement.focus();
   }
  }

  ngAfterViewInit() {
    //this.addTableCellResize();
    if(this.setFocus && this.isEditMode){
      this.ipEl.nativeElement.focus();
    }

  }

  validateInputElement(){

    return this.validateTextFields(this.ipEl.nativeElement.value, this.ipEl.nativeElement.required)
    // if(this.ipEl.nativeElement.type == 'text' && this.ipEl.nativeElement.required && this.ipEl.nativeElement.value == ''){
    //   this.highlight('#fa0404');
    //   return false;
    // }
    // else{
    //   return true
    // }
  }

  validateTextFields(value:any , required: boolean){
    let response:Boolean;
   // if(this.type == 'text'){
    if (required && value.length < 1) {
          this.highlight('#fa0404');
          response = false;
      } else
      {
        this.highlight('#8f9bb3');
        response = true;
      }
   // }
    //else if (this.type == 'creditcard' ){ 
      // if(required && value.length < 1) {
      //   this.highlight('#fa0404');
      //   response = false;
      // } else
      // {
      //   this.highlight('#8f9bb3');
      //   response = true;
      // }
   // }

    if (this.type == 'email' && value.length > 0) {
        if (value.match(this.mailformat)) {
             this.highlight('#8f9bb3');
             return true;
            } else {
              this.highlight('#fa0404');
              return false;
        }
    }
    else if (this.valueType == 'time') {
            if (value.match(this.timeFormat)) {
              this.highlight('#8f9bb3');
              return true;
            } else {
              if(required){
                this.highlight('#fa0404');
                return false;
              }              
            }
          }
    // switch (this.type) {
    //   case 'text':
    //     if (required && value.length < 1) {
    //           this.highlight('#fa0404');
    //           response = false;
    //       } else
    //       {
    //         this.highlight('#8f9bb3');
    //         response = true;
    //       }
    //   break;
    //   // case 'email':
    //   //   if (value.match(this.mailformat)) {
    //   //          this.highlight('#8f9bb3');
    //   //          response = true;
    //   //   } else {
    //   //     if(required){  this.highlight('#fa0404');}
    //   //     response = false;
    //   //   }
    //   // break;
    //   case 'mobile':
    //     if (value.match(this.mobileFormat)) {
    //        this.highlight('#8f9bb3');
    //        response = true;
    //     } else {
    //       if (required) {  this.highlight('#fa0404');}
    //       response = false;
    //     }
    //   break;
    //   case 'zip':
    //   if (value.match(this.zipCodeFormat)) {
    //          this.highlight('#8f9bb3');
    //          response = true;
    //   } else {
    //     if (required) {  this.highlight('#fa0404');}
    //     response = false;
    //   }
    // break;
    // }
    return response;
  }

  // @Output() isChildConponentValid : EventEmitter<any> = new EventEmitter<any>()

  // public validateChildComponent(data){
  //   console.log('validateChildComponent', data)
  //   return this.onInput(data) ? this.isChildConponentValid.emit(true) : this.isChildConponentValid.emit(false)

  // }
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
