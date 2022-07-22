import { Component, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { OperationsService } from 'src/app/services/operation.service';
import { ApplicationService } from 'src/app/services/application.service';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router } from '@angular/router';
import { DropdownGridComponent } from 'src/app/content/partials/components/dropdown-grid/dropdown-grid.component';
import AuthService from 'src/app/services/auth.service';
import {UtilitiesService} from '../../../../../../services/utilities.service';
import { LoaderService } from 'src/app/services/loader.service';
import { Messages } from 'src/app/common/Messages';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-field-service-rep',
  templateUrl: './field-service-rep.component.html',
  styleUrls: ['./field-service-rep.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FieldServiceRepComponent implements OnInit {

  @ViewChildren(DropdownGridComponent) dropDownComponents: QueryList<DropdownGridComponent>;
  ddServiceReps: any[];
  ddServiceRepsHeaders: any[] =[["ID","representative_id"],["Name","representative_name"]];

  fieldReps: any = [];

  formModel: any;
  previousUrl: string;

  ddReset: boolean = false;
  isEditMode: boolean = true;
  selectedIndex: any;
  isFormValid:boolean = true;
  notesValid: boolean = true;
  fieldRepValue: string;

  constructor( private router: Router,
               private dialogService : DialogService,
               private operationService: OperationsService,
               private utilitiesService: UtilitiesService,
               private localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.getFieldRepresentatives();
    this.getAgents();
    this.configFormModel();
    this.previousUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateUrl`)
  }
  getFieldRepresentatives() {
     this.utilitiesService.getField_representatives().subscribe((result: any) => {
      if (result.error) {
        alert('Error - utilities/field-representatives');
      }
      this.ddServiceReps = result;
    });
  }
  getAgents() {
    LoaderService.instance.show();
    this.operationService.getFieldServiceAgents(ApplicationService.instance.order_id).subscribe((result: any) => {
      if(result.error){
        alert('Error - orders/agents?orderid=');
      }
      LoaderService.instance.close();
      this.fieldReps =  result.agents;

    });
  }
  configFormModel() {
    this.formModel = {notes: '', agentName: '', agentId: '', statusCode: ''};
  }


  /*----BTN CLICK HANDLERS-------------*/
  addBtnClickhandler(event) {
    if (!this.validateIPElements()) {
      return ;
    }
    this.formModel.active = 1;
    this.formModel.fieldServiceNoteId = null;
    this.formModel.createdBy = AuthService.getInstance().userId;
    this.formModel.orderId = ApplicationService.instance.order_id;
    this.formModel.statusCode = 'I';
    this.fieldReps.push(this.formModel);

    this.clearModel();


  }
  updateBtnClickhandler(event) {
    if (!this.validateIPElements()) {
      return ;
    }
    this.formModel.active = 1;
    if (this.formModel.statusCode === null) {
      this.formModel.statusCode = 'U';
    }

    this.formModel.statusCode = (this.formModel.statusCode && this.formModel.statusCode !== 'I') ? 'U' : 'I';
    this.formModel.modifiedBy = AuthService.getInstance().userId;
    this.formModel.orderId = ApplicationService.instance.order_id;

    Object.assign(this.fieldReps[this.selectedIndex], this.formModel);
    this.clearModel();
  }

  closeBtnClickhandler(event) {
    this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateUrl`);
    this.router.navigateByUrl(this.previousUrl);
  }

  saveBtnClickhandler(event) {
    if (this.fieldReps && this.fieldReps.length > 0) {
      const agents: any = {agents: this.fieldReps};
      const userId: any = AuthService.getInstance().userId;
      this.operationService.savefieldServiceAgents(agents, userId).subscribe((response: any) => {
        if (response.error) {
          alert('Error - save orders/agents');
        }
        this. getAgents();

      });
    }
  }
  editClickHandler(event, row , i) {
    this.isEditMode = false;
    this.selectedIndex = i;
    Object.assign(this.formModel, row);
    this.fieldRepValue = this.formModel.agentName;

  }
  deleteClickHandler(event, row , i) {
    const dialogRef = this.dialogService.showConfirmationPopup(Messages.DELETE_TITLE,Messages.CONFIRM_DELETE_ROW);

    dialogRef.afterClosed().subscribe(result => {
    if (result && result.clickedOkay) {
        this.deleteRecords(row,i);
      }
    });

  }




  /*-----Drop Down Change Handler--------------*/
  ddServiceRepsSelecthandler(event, key) {
    this.formModel.agentName =   event['representative_name'];
    this.formModel.agentId =   event['representative_id'];
    this.ddReset = false;
  }
  notesChange(event) {

  }
/*-------------------------------*/
validateIPElements() {
      this.isFormValid = true;
      if (this.formModel &&  this.formModel.notes === undefined || this.formModel.notes === '') {
        this.notesValid = false ;
        this.isFormValid = false ;
      }
      if (this.dropDownComponents) {
        for (let dropdown of this.dropDownComponents.toArray()) {
          if (!dropdown.validateInputElement())  {
            this.isFormValid = false;
          }
        }
      }
      return this.isFormValid;
}
clearModel() {
  this.formModel = {notes: '', agentName: '', agentId: '', statusCode: ''};
  this.ddReset = true;
  this.isEditMode = true;
  this.fieldRepValue ='';
  this.notesValid = true;
}
deleteRecords(row , index) {
  if (row.statusCode && row.statusCode === 'I') {
    this.fieldReps.splice(index, 1);
  } else {
    row.deletedBy = AuthService.getInstance().userId;
    row.statusCode = 'D';
  }
}

public noteChangehandler(event){
  this.formModel.notes = event;
}

}
