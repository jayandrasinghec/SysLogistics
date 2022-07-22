import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApplicationService } from 'src/app/services/application.service';
import { Subject } from 'rxjs';

@Injectable()
export class ModelService {

   modelUpdate$: BehaviorSubject<any> = new BehaviorSubject(null);

   // modelUpdate$ = this.modelUpdate.asObservable();

    modelUpdated(event: string) {
        this.modelUpdate$.next(event);
    }
    reset() {
      this.modelUpdate$.next(null);
    }




}
