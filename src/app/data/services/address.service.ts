import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Address } from 'node:cluster';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/core/services/http-error-handler.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private eh: HttpErrorHandler = new HttpErrorHandler();
  private url: string = `${environment.apiUrl}/api/addresses`;

  constructor(private http: HttpClient) { }

  createAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(this.url, address)
      .pipe(catchError(this.eh.handleError));
  }

  getAddress(id: string): Observable<Address> {
    return this.http.get<Address>(this.url)
      .pipe(catchError(this.eh.handleError));
  }
}