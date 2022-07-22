import {Component, OnInit, Input, HostBinding, OnDestroy,	Output,	ViewEncapsulation} from '@angular/core';
import {LoaderService} from '../../../../services/loader.service';
import { MatDialog } from '@angular/material';
import {LoaderAnimationComponent} from './loader-animation/loader-animation.component';
@Component({
  selector: 'app-spinning-loader',
  templateUrl: './spinning-loader.component.html',
  styleUrls: ['./spinning-loader.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpinningLoaderComponent implements OnInit, OnDestroy {
private dialogRef: any;
constructor( public dialog: MatDialog) {
}

ngOnInit(): void {
  LoaderService.instance.eventChanged$.subscribe((event) => {
    if (event) {this.handlePopup(event)}
  });
}
ngOnDestroy(): void {

}
handlePopup(event){
  if(event ==='show'){
    this.openPopup() ;
  } else{
    this.closePopup() ;
  }


}
openPopup() {
  if (this.dialogRef == null) {
    this.dialogRef = this.dialog.open(LoaderAnimationComponent,
      {
        disableClose: true,
        backdropClass:'loader-backfrop',
        panelClass: 'loader_popup',
        width: '200',
        height: '200',
      });
  }
}
closePopup(){
  this.dialogRef.close();
  this.dialogRef = null;
}


}
