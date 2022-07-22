import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation, HostListener, ViewChild, EventEmitter, SimpleChanges, OnChanges} from '@angular/core';
import { Element } from '@angular/compiler';
import { BusinessRulesService } from 'src/app/services/business-rules.service';



@Component({
  selector: 'app-dropdown',
  styleUrls: ['dropdown.component.scss'],
  templateUrl: 'dropdown.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DropDownComponent implements OnChanges {

  @Input() isCreditCard: boolean = false;
  @Input() required?: boolean;
  @Input() options: any[] ;
  @Input() isEditMode : boolean;
  @Input() jsonField?: string;
  @Output() selection: EventEmitter<any> = new EventEmitter();
  defaultSelected = 'select';

  @ViewChild('ddElement', {static: false}) ddEl: any;
  
  constructor(private rulesService: BusinessRulesService) {
  }

  ngOnChanges(changes) {
  }

  @HostListener('document:keyup.enter', ['$event']) onKeyupHandler(event: KeyboardEvent) {
    if(this.ddEl.focused){
      this.ddEl.open();
      this.ddEl.focus();
    }

}

  selectFocus(event){
    this.highlight('#000000');
  }
  selectBlur(event){
    if (!this.ddEl.value || this.ddEl.value == 'select') {
      this.highlight('#fa0404');
    }
    else {
      this.highlight('#8f9bb3');
    }
  }
  changeOptions(event) {
    this.ddEl.focused = false;
    if (event.value != 'select') {
      this.highlight('#000000');
      this.selection.emit(event.value.toString());
      return true;
    }
    else {
      this.highlight('#fa0404');
      return false;
    }
  }
    private highlight(color: string) {
      this.ddEl.trigger.nativeElement.style.borderColor = color;
  }

  inputClickhandler(event){
    this.ddEl.open();
    this.ddEl.focus();
  }
  validateInputElement() {
    if (this.ddEl.required && !this.ddEl.value || this.ddEl.value == 'select') {
      this.highlight('#fa0404');
      return false;
    }
    else {
      this.highlight('#8f9bb3');
      return true;
    }
  }

  public isEditable() {
    if(this.isEditMode && this.jsonField) {
      return this.rulesService.shouldEditable(this.jsonField);
    }
    return this.isEditMode !== undefined ? this.isEditMode : true;
  }

}
