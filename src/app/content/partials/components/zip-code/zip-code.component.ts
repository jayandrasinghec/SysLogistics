import {Component, OnInit, Input, HostBinding,
   OnDestroy,	Output,	ViewEncapsulation,
   HostListener, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import { Element } from '@angular/compiler';




@Component({
  selector: 'app-zip-code',
  styleUrls: ['zip-code.component.scss'],
  templateUrl: 'zip-code.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ZIPCodeComponent {

  @Input() placeHolder?: any[] ;
  @Input() required?: boolean ;
  @Input() readonly?: boolean;
  @Input() value?: string;
  @Input() tabindex: number ;
  @Input() isCreditCard:boolean = false;
  @Output() zipCode: EventEmitter<any> = new EventEmitter() ;
  private regex = /[^0-9]/gi;

  @ViewChild('ipElement1', {static: false}) ipEl1: any;
  @ViewChild('ipElement2', {static: false}) ipEl2: any;

  constructor() {
  }
  ngOnChanges(changes: SimpleChanges)
  {
    if(changes && changes.value &&   changes.value.currentValue !== undefined && changes.value.currentValue !==  changes.value.previousValue ) {
      if(this.ipEl1){
      this.emitValue(changes.value.currentValue);
      }
      this.highlight(this.ipEl1, '#8f9bb3');
    }
  }

  public iptext1Changehandler(event) {
     const value: any = event.target.value;
     this.ipEl1.nativeElement.value =  value.replace(this.regex, '');
     this.emitValue( this.ipEl1.nativeElement.value + '-' + this.ipEl2.nativeElement.value);
  }
  public iptext2Changehandler(event) {
    const value: any = event.target.value;
    this.ipEl2.nativeElement.value =  value.replace(this.regex, '');
    this.emitValue( this.ipEl1.nativeElement.value + '-' + this.ipEl2.nativeElement.value);
  }
  public focusOutFunction(event, elem) {
    const value: any = event.target.value;
    if (value.length < event.target.minLength) {
      this.highlight(elem, '#fa0404');
      return false;
    } else {
      this.highlight(elem, '#8f9bb3');
    }
    this.emitValue(this.ipEl1.nativeElement.value + '-' + this.ipEl2.nativeElement.value);
  }
  emitValue(value) {
    this.zipCode.emit(value );
  }
  private highlight(el: any,  color: string) {
    if (el) {
      el.nativeElement.style.borderColor = color;
    }

  }

  validateInputElement(){
    if(this.ipEl1.nativeElement.value.length < 5 ){
      this.ipEl1.nativeElement.style.borderColor = this.ipEl1.nativeElement.value.length < 5 ? '#fa0404' : '#8f9bb3';
      //this.ipEl2.nativeElement.style.borderColor = this.ipEl2.nativeElement.value.length < 4 ? '#fa0404' : '#8f9bb3';
      return false;
    }
    else{
      return true
    }
  }
  zip1(){
      return (this.value) ? this.value.split('-')[0]:'';
  }
  zip2(){
    return (this.value && this.value.split('-')[1]) ? this.value.split('-')[1]:'';
  }

}
