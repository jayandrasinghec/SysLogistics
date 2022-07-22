import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import AuthService from 'src/app/services/auth.service';
import  {OperationsService} from 'src/app/services/operation.service';
@Component({
  selector: 'app-file-uploads',
  templateUrl: './file-uploads.component.html',
  styleUrls: ['./file-uploads.component.scss']
})
export class FileUploadsComponent implements OnInit {


  private tabID:any;
  private prevUrl:any;
  private bookingId:any;
  private fileToUpload:any;

  public formModel:any;
  public urls:any[]=[];
  public disableUpload:boolean = false;
  public validDescription:boolean =true;
  public validFile:boolean =true; 
  public acceptExtensions:any;

  constructor(private localStorageService: LocalStorageService, 
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private operationService: OperationsService 
              
              ) { }

  ngOnInit() {
    this.tabID = this.activatedRoute.snapshot.paramMap.get('tabId') ;
    this.prevUrl = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:navigateSubUrl`);
    this.configAcceptableExtensions();
    this.configBookingId();
    this.configModel();

 }
 configAcceptableExtensions(){
   if(this.tabID == 'POP' || this.tabID == 'POD'){
    this.acceptExtensions = '.jpg,.jpeg,.gif,.tiff,.PNG,.bmp';
   }else{
     this.acceptExtensions = '.xlsx,.xlsm,.tif,.rtf,.pdf,.jpeg,.xls,.htm,.jpg,.msg,.bmp,.gif,.doc,.tiff,.PNG,.odt,.docx,.pptx,.ods,.xltm,.eml';
   }   
 }
 configBookingId(){
   const order :any = this.localStorageService.getItem(`${ApplicationService.instance.order_id}:operation_order`);
  this.bookingId = JSON.parse(order).booking_ID;
 }
 
configModel(){
    this.formModel ={
      active_Flag:1,
      base64EncodedFile:'',
      booking_ID: this.bookingId,
      created_By: AuthService.getInstance().userId,
      file_Description:'',
      file_Extension:'',
      file_ID:0,
      file_Name:'',
      file_Type:this.tabID,
      online_Acccess:1,
      order_ID:ApplicationService.instance.order_id ,
      upload_ID:0

  }
} 
 getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}



  /*------------------------*/
  onSelectFile(Files:FileList){
    console.log('Files  ',Files);
    this.fileToUpload = Files.item(0) ;
    this.getBase64(this.fileToUpload).then((data)=>{
       this.formModel.base64EncodedFile =  data;
        this.formModel.file_Name =  this.fileToUpload.name;
         this.formModel.file_Extension =  this.fileToUpload.name.split('.')[1];

         console.log('this.formModel    ',this.formModel );
    }      
    );
  }

  descriptionChange(event){

  }

  closeBtnClickHandler(event){
  this.localStorageService.clear(`${ApplicationService.instance.order_id}:navigateSubUrl`);
  this.router.navigateByUrl( this.prevUrl);
  }
  uploadBtnClickHandler(event){
    this.disableUpload = true;
    if(!this.isValidFields()){
      return;
    } 
    this.operationService.uploadFile(this.formModel).subscribe((result:any)=>{
      if(result.error){
        alert('Error');
        return false;
      }
      this.router.navigateByUrl(this.prevUrl);

    })

  }


  isValidFields(){
    let valid = true;
    console.log('this.formModel.file_Description   ',this.formModel.file_Description.length );
    console.log('this.formModel.base64EncodedFile   ',this.formModel.base64EncodedFile.length );
    if(this.formModel && this.formModel.file_Description &&  this.formModel.file_Description  == ''){
       valid =false;
       this.validDescription = false;
    }
    if(this.formModel && this.formModel.base64EncodedFile &&  this.formModel.base64EncodedFile == ''){
        valid =false;
        this.validFile = false;
      }
    return valid;

  }



}
