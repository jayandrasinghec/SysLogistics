import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject , Observable, of} from 'rxjs';
@Injectable()
export class ClientSearchService {
    searchUrl: string = 'http://localhost:52386/api/Client/term';
     ddBillToOptions: any = [{value: 'intel',
                               label: 'Intel Only',
                               address1:'Address 1 Intel only',
                               address2:'Address 2 Intel only',
                               city:'City Intel only',
                               state :' state Intel only',
                               zipcode: '45689-4570'
                              },
                              {value: 'microsoft',
                              label: 'Microsoft Only',
                              address1:'Address 1 Microsoft',
                              address2:'Address 2 Microsoft',
                              city:'City Microsoft',
                              state :' state Microsoft',
                              zipcode: '45689-4578'
                             }];
    constructor(	private http: HttpClient) {

    }

  search(term: any): Observable<any[]> {
   /* return  this.http.get(this.searchUrl + '?term=' + term).pipe(
      map((r: any) => {
          return (r.json().length !== 0 ? r.json() : [{ ClientId: 0, ClientName: 'No Record Found' }]) as any[] ;
      }));*/
      let arrresult = [];
      for (let i = 0; i < this.ddBillToOptions.length; i++) {
        if (this.ddBillToOptions[i].label.substr(0, term.length).toUpperCase() === term.toUpperCase()) {
          arrresult.push(this.ddBillToOptions[i]);
        }
      }
      return  of(arrresult);

}
}
