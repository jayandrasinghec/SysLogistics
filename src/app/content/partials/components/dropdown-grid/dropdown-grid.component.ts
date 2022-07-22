import { Component, OnInit, Input, HostListener, ViewChild, OnChanges, SimpleChanges, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { BusinessRulesService } from 'src/app/services/business-rules.service';
@Component({
  selector: 'app-dropdown-grid',
  templateUrl: './dropdown-grid.component.html',
  styleUrls: ['./dropdown-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownGridComponent implements OnInit, OnChanges {

  //selectedValue:any;
  showGrid: boolean = false;
  private currentFocus = -1;
  @Input() headers: Array<any>;
  @Input() gridList: Array<any>;
  @Input() displayKey: string;
  @Input() reset: boolean;
  @Input() selectedValue: any;
  @Input() class: any;
  @Input() required?: any;
  @Input() tabindex?: any;
  @Input() setFocus?: any;
  @Input() isEditMode : boolean;
  @Input() isCreditCard: boolean = false;
  @Input() jsonField?: string;
  
  @Output() selection: EventEmitter <any> = new EventEmitter();

  @ViewChild('ipElement', {static: false}) ipEl: any;
  @ViewChild('divCarret', {static: false}) divC: any;
  @ViewChild('iCarret', {static: false}) iC: any;
  @ViewChild('listCon', {static: false}) listCon: any;
  @ViewChild('dropDownGridScroll', { static: false }) public dropDownGridScroll: PerfectScrollbarComponent;
  constructor(private rulesService: BusinessRulesService) { }

  ngOnInit() {
  }

  ngOnChanges(changes){
    if (changes.hasOwnProperty(`reset`) &&
       changes[`reset`][`currentValue`] !== undefined &&
       changes[`reset`][`currentValue`] === true) {
       this.selectedValue = '';
    }
    if (changes.hasOwnProperty(`gridList`) &&
       changes[`gridList`][`currentValue`] !== undefined &&
       changes[`gridList`][`currentValue`].length >0) {
       this.highlight('#8f9bb3');
    }
    if (changes.hasOwnProperty(`setFocus`) &&
    changes[`setFocus`][`currentValue`] !== undefined &&
    changes[`setFocus`][`currentValue`] === true && this.ipEl ) {
      this.ipEl.nativeElement.focus();
   }

  }


  ngAfterViewInit() {
   // this.addTableCellResize();
   if(this.setFocus){
    this.ipEl.nativeElement.focus();
  }

  }
  @HostListener('document:click', ['$event.target'])
  public onClickOutside(targetElement) {
   // console.log('targetElement ', targetElement);
   //  console.log('ipEl  ', this.ipEl);
    if (targetElement !== this.ipEl.nativeElement && targetElement !== this.divC.nativeElement
      && targetElement !== this.iC.nativeElement ) {
        this.showGrid = false;
    }
  }
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event) {
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

  inputClickhandler(event) {
    if(!this.isEditMode)
    {
      return;
    }
    this.showGrid = true;
    this.ipEl.nativeElement.focus();
  }
  enterBtnClickhandler(event){
    if(!this.isEditMode)
    {
      return;
    }
    if (this.currentFocus === -1) {
      this.showGrid = true;
    } else {
      this.currentFocus = -1;
    }

  }
  escapeBtnClickhandler(event){
    this.closeDropDownGrid();
  }

  focusoutBtnClickhandler(event){
    //this.closeDropDownGrid();
  }

  closeDropDownGrid(){
    // if (this.currentFocus === -1) {
    //   this.showGrid = false;
    // } else {
    //   this.currentFocus = -1;
    // }
    this.showGrid = false;
  }

  rowSelecthandler(row) {
    this.selectedValue = row[this.displayKey];
    this.selection.emit(row);
    this.showGrid = false;
    this.highlight('#8f9bb3');
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.addTableCellResize();
  }
 /* addTableCellResize( ) {
    if(document.querySelectorAll("tbody tr").length> 0 && document.querySelectorAll("thead tr").length > 0) {
      const arrTr: any = document.querySelectorAll("tbody tr")[0].childNodes;
      const arrTh: any = document.querySelectorAll("thead tr")[0].childNodes;
      arrTr.forEach( (td , i) => {
                  arrTh[i].style.width = `${td.offsetWidth}px` ;
      });
    }
  }*/
  validateInputElement() {
    if (this.ipEl.nativeElement.required && this.ipEl.nativeElement.value === '') {
      this.highlight('#fa0404');
      return false;
    } else {
      return true ;
    }
  }

  private highlight(color: string) {
    if(this.ipEl){
    this.ipEl.nativeElement.style.borderColor = color;
    }
  }

  public isEditable() {
    if(this.isEditMode && this.jsonField) {
      return this.rulesService.shouldEditable(this.jsonField);
    }
    return this.isEditMode !== undefined ? this.isEditMode : true;
  }

}
