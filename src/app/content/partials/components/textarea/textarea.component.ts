import { Component, OnInit , Input, Output,EventEmitter, ViewChild, OnChanges, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import { BusinessRulesService } from 'src/app/services/business-rules.service';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent implements OnInit {

  @ViewChild('ipElement', {static: false}) ipEl: any;
  @Input() height: string;
  @Input() value?: string;
  @Input() class?: string;
  @Input() placeHolder?: string;
  @Input() required?: boolean;
  @Input() tabindex?: number ;
  @Input() maxlength?: number;
  @Input() isEditMode : boolean;
  @Input() jsonField?: string;
  @Input() readonly?: boolean;
  @Output() focusOutEvent: EventEmitter<string>  = new EventEmitter();
  @Output() modelChange: EventEmitter<string>  = new EventEmitter();
  @Output() textInputEvent: EventEmitter<string>  = new EventEmitter();

  constructor(private rulesService: BusinessRulesService) { }

  ngOnInit() {
  }

  public textChange(event){    
    let value =  this.ipEl.nativeElement.value ;
    this.modelChange.emit(value);
  }

  public focusOutFunction(event) {
    let value = event.target.value;
    const required = event.target.required;
    this.focusOutEvent.emit(value);
  }

  public textInputFunction(event){
    let value = event.target.value;
    this.textInputEvent.emit(value);
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
