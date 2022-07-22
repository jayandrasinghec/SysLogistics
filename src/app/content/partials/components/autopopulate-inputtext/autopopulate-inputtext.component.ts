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
  ChangeDetectionStrategy} from '@angular/core';
import { Element } from '@angular/compiler';
import {ValidateService} from '../../../../services/validate.service';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-autopopulate-input-text',
  styleUrls: ['autopopulate-inputtext.component.scss'],
  templateUrl: 'autopopulate-inputtext.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AutopopulateInputTextComponent implements OnInit, OnChanges {

  selectedValue:any;
  showGrid: boolean = false;
  showSpinner: boolean = false;
  @Input() headers: Array<any>;
  @Input() gridList: Array<any>;
  @Input() displayKey: string;
  @Input() value?: string;
  @Input() class?: string;
  @Input() placeHolder?: string;
  @Input() width?: string;
  @Input() required?: boolean;
  @Input() submitted?: boolean;
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() isSearchable: boolean = true;
  @Input() tabindex?: any;
  @Input() setFocus?: any;
  @Input() isEditMode : boolean;
  @Input() showAlertBefore?: boolean;
  @Input() jsonField?: string;

  @Output() serchText: EventEmitter <string> = new EventEmitter();
  @Output() selection: EventEmitter <any> = new EventEmitter();
  @ViewChild('ipElement', {static: false}) ipEl: any;
  @ViewChild('Divcaret', {static: false}) caretEl: any;
  @ViewChild('iCarret', {static: false}) iC: any;
  @ViewChild('listCon', {static: false}) listCon: any;
  @ViewChild('dropDownGridScroll', { static: false }) public dropDownGridScroll: PerfectScrollbarComponent;


  private currentFocus = -1;
  public inputValue: string = '';

  constructor(private dialogService : DialogService,
    private rulesService: BusinessRulesService) {

  }

  ngOnChanges(changes) {
    if (changes.hasOwnProperty(`gridList`) &&
        changes[`gridList`][`currentValue`] !== undefined ) {
     this.showSpinner = false;
    }
    if (changes.hasOwnProperty(`setFocus`) &&
    changes[`setFocus`][`currentValue`] !== undefined &&
    changes[`setFocus`][`currentValue`] === true && this.ipEl && this.isEditMode ) {
      this.ipEl.nativeElement.focus();
   }

  }


  ngOnInit() {
    const owner: any = this;
   // document.addEventListener('click', (e) => {  owner.closeAllLists(); } );
   // this.addTableCellResize();
  }
  ngAfterViewInit() {
    //this.addTableCellResize();
    if(this.setFocus && this.isEditMode){
      this.ipEl.nativeElement.focus();
    }

  }
  @HostListener('focus') onMouseOver() {
      if(this.isEditMode){
          this.ipEl.nativeElement.style.borderColor = "#000000";
      }

}
  @HostListener('window:resize', ['$event'])
  onResize(event) {
     //this.addTableCellResize();
  }
  @HostListener('document:click', ['$event.target'])
  public onClickOutside(targetElement) {
    if (this.ipEl && this.ipEl.nativeElement &&  targetElement !== this.ipEl.nativeElement
        && this.caretEl && targetElement !== this.caretEl.nativeElement
        && this.iC && targetElement !== this.iC.nativeElement  ) {
      this.closeAllLists();
    }
  }
  addTableCellResize( ) {
    const arrTr: any = document.querySelectorAll("tbody tr")[0].childNodes;
    const arrTh: any = document.querySelectorAll("thead tr")[0].childNodes;
    arrTr.forEach( (td , i) => {
                arrTh[i].style.width = `${td.offsetWidth}px` ;
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event) {
    //let elem =  event.target;
    // let value = elem.value;
    if ( this.listCon === undefined) { return; }
    let x: any = this.listCon.nativeElement;
    if (x) { x = x.getElementsByTagName('tr'); }
    if ( x === undefined) { return; }

    if (event.keyCode == 40) { //Down
      this.currentFocus++;
      this.addActive(x);
    } else if (event.keyCode == 38) { //up
      this.currentFocus--;
      this.addActive(x);
    } else if (event.keyCode == 13) {
      event.preventDefault();
      if (this.currentFocus > -1) {
        if (x){x[this.currentFocus].click();}
      }
    }
  }
  private addActive(x) {
    if (!x){return false;}
    this.removeActive(x);
    if (this.currentFocus >= x.length){ this.currentFocus = 0;}
    if (this.currentFocus < 0){ this.currentFocus = (x.length - 1);}
    x[this.currentFocus].classList.add('autocomplete-active');
    this.listCon.nativeElement.scrollTop  = 0;
    const scrollPos = ( x[this.currentFocus].offsetTop - 100 );
    this.dropDownGridScroll.directiveRef.scrollTo(0,  scrollPos);

  }
  private removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }
  private closeAllLists() {
    let x = document.getElementsByClassName('autocomplete-items');
    for (var i = 0; i < x.length; i++) {
       x[i].parentNode.removeChild(x[i]);
    }
    //this.gridList = [];
    this.showGrid = false;
   // this.currentFocus = -1 ;
  }
  public focusOutFunction(event) {
    // this.closeGrid();
    let value: any = event.target.value;
    const required = event.target.required;
    if (value.length > 0) {
      this.highlight('#8f9bb3');
      return true;
   } else {
           if(required){  this.highlight('#fa0404');}
             return false;
           }
  }

  private highlight(color: string) {
      this.ipEl.nativeElement.style.borderColor = color;
  }

  rowSelecthandler(row) {
    this.value =  row[this.displayKey];
    this.selection.emit(row);
    this.highlight('#8f9bb3');
   // this.currentFocus = -1 ;
  }


   validateInputElement(){
    if (this.ipEl.nativeElement.required && this.ipEl.nativeElement.value === '' ) {
      this.highlight('#fa0404');
      return false;
    } else {
      return true ;
    }
  }
  enterBtnClickhandler(event) {
    if(!this.isEditMode)
    {
      return;
    }
    const val = this.value = this.ipEl.nativeElement.value;
    if (val === '' &&  this.isSearchable) {return false; }
    if (this.showAlertBefore && this.showAlertBefore === true) {
      this.showAlert(val);
    } else {
      this.doSearch(val);
    }

    /*if ( this.currentFocus === -1 && this.inputValue !== val) {
      this.showGrid = true;
      if(this.isSearchable){
      this.showSpinner = true;
      }
      this.serchText.emit(val);
      this.inputValue = val ;
    } else if (this.headers && this.headers.length > 0 &&  this.gridList && this.gridList.length > 0  &&  this.currentFocus === -1) {
      this.showGrid = true;
      this.showSpinner = false;
    }
   this.currentFocus = -1 ;*/
  }
  doSearch(val:any) {

    if ( this.currentFocus === -1 && this.inputValue !== val) {
      this.showGrid = true;
      this.ipEl.nativeElement.focus();
      if (this.isSearchable) {
      this.showSpinner = true;
      }
      this.serchText.emit(val);
      this.inputValue = val ;
    } else if (this.headers && this.headers.length > 0 &&  this.gridList && this.gridList.length > 0  &&  this.currentFocus === -1) {
      this.showGrid = true;
      this.showSpinner = false;
      this.ipEl.nativeElement.focus();
    }
    this.currentFocus = -1 ;

  }
  showAlert(val: any) {
    const dialogRef = this.dialogService.showInfoPopup(Messages.WARNING_TITLE,Messages.WARNING_CHANGING_BILL_NAME);
    
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.clickedOkay) {
        this.doSearch(val);
      }
      });
  }
  escapeBtnClickhandler(event){
    this.closeGrid();
  }

  closeGrid(){
    // if (this.currentFocus === -1) {
    //   this.showGrid = false;
    // } else {
    //   this.currentFocus = -1;
    // }
    this.currentFocus = -1;
    this.showGrid = false;
  }

  serchBtnClickhandler($event) {
    if (!this.isEditMode)
    {
      return;
    }
    const val = this.ipEl.nativeElement.value;
    if (val === '' && this.isSearchable) {
      return false; }
    if (this.showAlertBefore && this.showAlertBefore === true) {
      this.showAlert(val);
    } else {
        this.doSearch(val);
    }
   /* if (this.inputValue !== val ) {
      this.showGrid = true;
      this.ipEl.nativeElement.focus();
      if(this.isSearchable){
      this.showSpinner = true;
      }
      this.serchText.emit(val);
      this.inputValue = val ;
    } else if (this.headers && this.headers.length > 0 &&  this.gridList && this.gridList.length > 0 ){
      this.showGrid = true;
      this.showSpinner = false;
      this.ipEl.nativeElement.focus();
    }*/
  }

  public textChange(event) {
    const value =  this.ipEl.nativeElement.value ;
    // this.serchText.emit(value);
  }

  public isEditable() {
    if(this.isEditMode && this.jsonField) {
      return this.rulesService.shouldEditable(this.jsonField);
    }
    return this.isEditMode !== undefined ?this.isEditMode:true;
  }
}
