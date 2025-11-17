import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Beneficiary, 
  CreateBeneficiaryRequest, 
  UpdateBeneficiaryRequest,
  DeleteBeneficiaryResponse
} from '../models/beneficiary.model';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private apiUrl = `${environment.apiUrl || 'https://tu-api.com/api'}/beneficiaries`;

  constructor(private http: HttpClient) {}

  getMyBeneficiaries(filters?: any): Observable<Beneficiary[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Beneficiary[]>(this.apiUrl, { params });
  }

  getBeneficiaryById(id: string): Observable<Beneficiary> {
    return this.http.get<Beneficiary>(`${this.apiUrl}/${id}`);
  }

  createBeneficiary(data: CreateBeneficiaryRequest): Observable<Beneficiary> {
    return this.http.post<Beneficiary>(this.apiUrl, data);
  }

  updateBeneficiary(id: string, data: UpdateBeneficiaryRequest): Observable<Beneficiary> {
    return this.http.put<Beneficiary>(`${this.apiUrl}/${id}`, data);
  }

  deleteBeneficiary(id: string): Observable<DeleteBeneficiaryResponse> {
    return this.http.delete<DeleteBeneficiaryResponse>(`${this.apiUrl}/${id}`);
  }

  confirmBeneficiary(id: string): Observable<Beneficiary> {
    return this.http.put<Beneficiary>(`${this.apiUrl}/${id}/confirm`, {});
  }

  checkPendingOperations(id: string): Observable<{ hasPending: boolean; count: number }> {
    return this.http.get<{ hasPending: boolean; count: number }>(
      `${this.apiUrl}/${id}/pending-operations`
    );
  }
}