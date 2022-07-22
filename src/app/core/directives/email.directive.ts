import { EventEmitter, Directive, ElementRef, HostListener, Input } from '@angular/core';
@Directive({
  selector: '[appEmail]'
})
export class EmailDirective {
  private mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  constructor(private el: ElementRef) { }
  @HostListener('mouseenter') onMouseEnter() {

  }
  @HostListener('input', ['$event.target.value'])
  onInput(value) {

    if (value.match(this.mailformat)) {
      this.highlight('#8f9bb3');
      return true;
    } else {
      this.highlight('#fa0404');
      return false;
    }
  }
  private highlight(color: string) {
    this.el.nativeElement.style.borderColor = color;
  }

}

