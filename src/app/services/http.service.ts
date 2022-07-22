import { Injectable } from '@angular/core';
import AuthService from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  public get(url): Observable<any>{
    return this.http.get(url, AuthService.getInstance().headersWithToken)
      .pipe(
        catchError(this.callError),
        retry(1),
        catchError(this.handleError({error:true})),
        this.responseCheck()
      );
  }

  public post(url, postData): Observable<any> {
    return this.http.post(url, postData, AuthService.getInstance().headersWithToken)
      .pipe(
        catchError(this.callError),
        retry(1),
        catchError(this.handleError({error:true})),
        this.responseCheck()
      );
  }

  public put(url, updateData): Observable<any> {
    return this.http.put(url, updateData, AuthService.getInstance().headersWithToken)
    .pipe(
      catchError(this.callError),
      retry(1),
      catchError(this.handleError({error:true})),
      this.responseCheck()
    );
  }

  public delete(url): Observable<any> {
    return this.http.delete(url, AuthService.getInstance().headersWithToken)      
    .pipe(
      catchError(this.callError),
      retry(1),
      catchError(this.handleError({error:true})),
      this.responseCheck()
    );
  }

  public getSearch(url,term): Observable<any>{
    return this.http.get(url, AuthService.getInstance().headersWithToken)
      .pipe(
        catchError(this.callError),
        retry(1),
        catchError(this.handleError({error: true, term:term})),
        this.responseSearch(term)
      );
  }

  private callError(error) {
    console.error(error);
    return throwError(error);
  }

  private handleError<T> (result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  public responseCheck(){
    return map((r: any) => {
        if(r.error){
          return r;
        }
        if(r.code == 201 || r.code == 200){
          return r.result
        }
        return [];
    })
  }

  public responseSearch(term:any){
    return map((r: any) => {
        if(r.error){
          return {term:term , error: r.error}
        }
        if(r.code == 201 || r.code == 200){
          return {term: term , result: r.result}
        }
        return {term:term , result: []}
    })
  }

}
