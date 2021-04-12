import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../schema/country';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private _http: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this._http.get<Country[]>('./../../../assets/json/country-codes.json');
  }
}
