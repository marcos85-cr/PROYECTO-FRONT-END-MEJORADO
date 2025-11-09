
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentProvider {
  id: string;
  nombre: string;
  codigoValidacion: string;
}

export interface Payment {
  id: string;
  proveedorId: string;
  proveedorNombre: string;
  numeroContrato: string;
  monto: number;
  cuentaOrigenId: string;
  estado: string;
  numeroReferencia: string;
  fecha: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getProviders(): Observable<PaymentProvider[]> {
    return this.http.get<PaymentProvider[]>(`${this.apiUrl}/providers`);
  }

  makePayment(data: any): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}`, data);
  }

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/my-payments`);
  }

  downloadReceipt(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/receipt`, {
      responseType: 'blob',
    });
  }
}