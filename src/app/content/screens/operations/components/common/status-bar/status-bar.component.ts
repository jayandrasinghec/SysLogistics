import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent implements OnInit {
  @Input() progress: number;
  @Input() description:string;

  public progressTextPosition = this.progress;

  @ViewChild("statusText", {static:false}) statusText: ElementRef;
  @ViewChild("statusTextContainer", {static:false}) statusTextContainer: ElementRef;

  constructor() { }

  ngOnInit() {

  }

  getPosition(prog) {
    let val = prog;
    if(this.statusText) {
      val = this.getStatusTextPosition(prog);
    }

    return val;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.progressTextPosition = this.getStatusTextPosition(this.progress);
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this.progressTextPosition = this.getStatusTextPosition(this.progress);
    }, 500);
  }

  getStatusTextPosition(progress) {
    const widthStatusText = this.statusText.nativeElement.offsetWidth;
    const widthStatusTextContainer = this.statusTextContainer.nativeElement.offsetWidth;
    const pixelToPercent = (widthStatusText*100)/widthStatusTextContainer;
    let val = progress;
    if((progress >= pixelToPercent/2) && ((100 - progress) >= pixelToPercent/2)){
      val = progress - (pixelToPercent/2);
    }else{
      if(progress < 50){
        val = 0;
      }else{
        val = 100-pixelToPercent;
      }
    }
    return val;
  }

}
