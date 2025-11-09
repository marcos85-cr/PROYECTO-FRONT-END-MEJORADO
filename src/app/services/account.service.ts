


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Account, CreateAccountRequest } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl || 'https://tu-api.com/api'}/accounts`;

  constructor(private http: HttpClient) {}

  getMyAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/my-accounts`);
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`);
  }

  getAllAccounts(filters?: any): Observable<Account[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Account[]>(this.apiUrl, { params });
  }

  createAccount(data: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, data);
  }

  blockAccount(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/block`, {});
  }

  closeAccount(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/close`, {});
  }

  getAccountBalance(id: string): Observable<{ saldo: number; disponible: number }> {
    return this.http.get<{ saldo: number; disponible: number }>(
      `${this.apiUrl}/${id}/balance`
    );
  }
}