import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { API } from '../common/api';
import { LocalStorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessRulesService {

  private _sectionRules: any[];
  private _fieldRules: any[];

  constructor(private httpService: HttpService,
    private localStorageService: LocalStorageService) { }

  public initilize(rules) {
    this.clearRules();
    this.updateRules(rules);
  }

  public getRules(orderid): Observable<any> {
    return this.httpService.get(`${API.RULES_API}?orderid=${orderid}`)
  }

  public clearRules() {
    this.localStorageService.clear('rules');
    this._sectionRules = [];
    this._fieldRules = [];
  }

  // check fields section should be editable or not
  public shouldSectionDisabled(key: string): boolean {
    if(!this._sectionRules) {
      this.updateRules(JSON.parse(this.localStorageService.getItem('rules')));
    }
    return this._sectionRules? this._sectionRules.includes(key) : false;
  }

  // check field should editable or not
   public shouldEditable(key: string): boolean {
    if(!this._fieldRules) {
      this.updateRules(JSON.parse(this.localStorageService.getItem('rules')));
    }
    return this._fieldRules ? !this._fieldRules.includes(key) : true;
  }

  public updateRules(rulesData) {
    let fieldRules = [];
    let sectionRules = [];

    if(rulesData && !rulesData.error) {
      for(let element of rulesData) {
        if(element["nonEditableFields"]) {
          fieldRules = [...fieldRules, ...element["nonEditableFields"]];
        }
        if(element["nonEditableSections"]) {
          sectionRules = [...sectionRules, ...element["nonEditableSections"]];
        }
      };

      this._fieldRules = [...new Set(fieldRules)];// converting section names to lowercase
      this._sectionRules = [...new Set(sectionRules)];
      
      this._sectionRules = this._sectionRules.map(function(section) {
        return section.toLowerCase();
      });
  
      this.localStorageService.saveData('rules', JSON.stringify(rulesData));
    }
  }



}
