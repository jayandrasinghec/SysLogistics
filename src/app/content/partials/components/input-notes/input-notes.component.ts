import { Component, OnInit , Input, Output,EventEmitter, ViewChild, OnChanges, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import { UtilsService } from 'src/app/services/Utils.service';
import AuthService from 'src/app/services/auth.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';

@Component({
  selector: 'app-input-notes',
  templateUrl: './input-notes.component.html',
  styleUrls: ['./input-notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputNotesComponent implements OnInit, OnChanges {  

  @ViewChild('ipElement', {static: false}) ipEl: any;
  @Input() height: any;
  @Input() noteList: Array<any>;
  @Input() value?: string;
  @Input() modelName:any;
  @Input() isEditMode : boolean;
  @Input() jsonField?: string;
  @Input() readonly?: boolean;
  @Input() setFocus?: any;
  @Input() class?: string;
  @Output() focusOutEvent: EventEmitter<string>  = new EventEmitter();
  @Output() modelChange: EventEmitter<string>  = new EventEmitter();
  
  public autoHeight : any;
  public scrollbarHeight : any;
  // gridList:Array<Object> = [
  //     {id: 1, text: 'Data 1'},
  //     {id: 2, text: 'Data 2'},
  //     {id: 3, text: 'Data 3'},
  //     {id: 4, text: 'Data 4 '},
  // ];
  
  constructor(public utilsService:UtilsService,
      private rulesService: BusinessRulesService) { }

  ngOnInit() {
    this.scrollbarHeight =`${this.height}px`;    
  }

  autoGrow(e){
    this.autoHeight=e.target;
    this.autoHeight.style.height = "0px";
    this.autoHeight.style.height = (this.autoHeight.scrollHeight)+"px";
  }

  ngOnChanges(changes: SimpleChanges)
  {    
    if (changes.hasOwnProperty(`setFocus`) &&
    changes[`setFocus`][`currentValue`] !== undefined &&
    changes[`setFocus`][`currentValue`] === true && this.ipEl ) {
      this.ipEl.nativeElement.focus();
   }
  }

  ngAfterViewInit() {
    //this.addTableCellResize();
    if(this.setFocus){
      this.ipEl.nativeElement.focus();
    }

  }

  public focusOutFunction(event) {
    let value = event.target.value;
    this.focusOutEvent.emit(value);;
  }

  public textChange(event){
    const value =  this.ipEl.nativeElement.value ;    
    this.modelChange.emit(value);
  }

  public getuserName(userId) {
    return userId == AuthService.getInstance().userId ? AuthService.getInstance().userName : userId;
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