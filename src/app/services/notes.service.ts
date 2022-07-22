import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { API } from '../common/api';
import { HttpService } from './http.service';

@Injectable()
export class NotesService{

    constructor(private httpService: HttpService) {
    }

    public getNotesData(bookingID: any): Observable<any[]> {
        return this.httpService.get(`${API.GET_NOTES_DATA_API}${bookingID}`);
    }

    public createNotes(notesData: any, bookingID: any){
      return this.httpService.post(`${API.CREATE_NOTES_DATA_API}${bookingID}/notes`,notesData);
    }

}