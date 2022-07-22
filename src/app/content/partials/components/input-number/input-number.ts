import {Component, OnInit, Input, HostBinding,
  OnDestroy,	Output,	ViewEncapsulation,
  HostListener, ViewChild, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import { Element } from '@angular/compiler';
import { BusinessRulesService } from 'src/app/services/business-rules.service';





@Component({
 selector: 'app-input-number',
 styleUrls: ['input-number.scss'],
 templateUrl: 'input-number.html',
 changeDetection: ChangeDetectionStrategy.OnPush

})
export class InputNumberComponent {
  @Input() id?: string ;
 @Input() isValid?: boolean ;
 @Input() placeHolder?: any[] ;
 @Input() required?: boolean ;
 @Input() readonly?: boolean;
 @Input() value?: string;
 @Input() minLength?: string;
 @Input() maxLength?: string;
 @Input() editable?: boolean;
 @Input() bgcolor?: string;
 @Input() textAlign?: string;
 @Input() fontWeight?: string;
 @Input() autofocus?: boolean;
 @Input() disabled?: boolean;
 @Input() isEditMode : boolean;
 @Input() jsonField?: string;
 @Output() changeEvent: EventEmitter<any> = new EventEmitter() ;
 @Output() focusOutEvent: EventEmitter<any> = new EventEmitter() ;
 private regex = /[^\d.-]/ig;

 @ViewChild('ipElement1', {static: false}) ipEl1: any;


 constructor(private rulesService: BusinessRulesService) {
 }
 public iptextChangehandler(event) {
    const value: any = event.target.value;
    this.ipEl1.nativeElement.value =  value.replace(this.regex, '');
    this.emitValue();
 }
 public focusOutFunction(event) {
   const value: any = event.target.value;
   if (value === ''||  value.length < event.target.minLength) {
     this.highlight('not-valid');
     return false;
   } else {
     this.highlight('valid');
   }
   this.focusOut();
 }
 emitValue() {
   /*if ( this.ipEl1.nativeElement.value.length < 5 ) {
     return ;
   }*/
   this.changeEvent.emit(this.ipEl1.nativeElement.value);
 }
 focusOut() {
  this.focusOutEvent.emit('focusOut');
 }

 private highlight(status: string) {
  this.ipEl1.nativeElement.style.borderColor = (status === 'valid') ?  '#A9A9A9' : '#fa0404';
 }

 validateInputElement() {
   if (this.ipEl1.nativeElement.value.length < 5) {
     this.ipEl1.nativeElement.style.borderColor = this.ipEl1.nativeElement.value.length < 5 ? '#fa0404' : '#8f9bb3';
     return false;
   } else {
     return true ;
   }
 }

 isEditable() {
  if(this.readonly) {
    return false;
  }
  if(this.isEditMode && !this.readonly && this.jsonField) {
    return this.rulesService.shouldEditable(this.jsonField);
  }
  return this.isEditMode !== undefined ? this.isEditMode : true;
}

}
