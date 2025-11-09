
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  downloadStatement(
    accountId: string,
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'csv'
  ): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/statement`,
      {
        accountId,
        startDate,
        endDate,
        format,
      },
      { responseType: 'blob' }
    );
  }

  downloadReceipt(transactionId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipt/${transactionId}`, {
      responseType: 'blob',
    });
  }
}