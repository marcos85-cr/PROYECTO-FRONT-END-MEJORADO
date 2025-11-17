import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HighValueOperation,
  HighValueOperationStatus,
  RiskLevel,
  ApproveOperationRequest,
  RejectOperationRequest,
  BlockOperationRequest,
} from '../models/high-value-operation.model';

@Injectable({
  providedIn: 'root',
})
export class HighValueOperationService {
  private apiUrl = `${environment.apiUrl || 'https://tu-api.com/api'}/high-value-operations`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las operaciones de alto valor
   */
  getAllOperations(filters?: any): Observable<HighValueOperation[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<HighValueOperation[]>(this.apiUrl, { params });
  }

  /**
   * Obtiene una operación por ID
   */
  getOperationById(id: string): Observable<HighValueOperation> {
    return this.http.get<HighValueOperation>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene operaciones pendientes
   */
  getPendingOperations(): Observable<HighValueOperation[]> {
    return this.http.get<HighValueOperation[]>(
      `${this.apiUrl}/pending`,
      { params: new HttpParams().set('estado', HighValueOperationStatus.PENDIENTE) }
    );
  }

  /**
   * Obtiene operaciones por estado
   */
  getOperationsByStatus(status: HighValueOperationStatus): Observable<HighValueOperation[]> {
    return this.http.get<HighValueOperation[]>(this.apiUrl, {
      params: new HttpParams().set('estado', status),
    });
  }

  /**
   * Obtiene operaciones de alto riesgo
   */
  getHighRiskOperations(): Observable<HighValueOperation[]> {
    return this.http.get<HighValueOperation[]>(
      `${this.apiUrl}/high-risk`,
      { params: new HttpParams().set('nivelRiesgo', RiskLevel.CRITICO) }
    );
  }

  /**
   * Obtiene operaciones por cliente
   */
  getOperationsByClient(clienteId: string): Observable<HighValueOperation[]> {
    return this.http.get<HighValueOperation[]>(this.apiUrl, {
      params: new HttpParams().set('clienteId', clienteId),
    });
  }

  /**
   * Aprueba una operación
   */
  approveOperation(request: ApproveOperationRequest): Observable<HighValueOperation> {
    return this.http.put<HighValueOperation>(
      `${this.apiUrl}/${request.operacionId}/approve`,
      request
    );
  }

  /**
   * Rechaza una operación
   */
  rejectOperation(request: RejectOperationRequest): Observable<HighValueOperation> {
    return this.http.put<HighValueOperation>(
      `${this.apiUrl}/${request.operacionId}/reject`,
      request
    );
  }

  /**
   * Bloquea una operación
   */
  blockOperation(request: BlockOperationRequest): Observable<HighValueOperation> {
    return this.http.put<HighValueOperation>(
      `${this.apiUrl}/${request.operacionId}/block`,
      request
    );
  }

  /**
   * Agrega notas a una operación
   */
  addNotes(operacionId: string, notas: string): Observable<HighValueOperation> {
    return this.http.put<HighValueOperation>(
      `${this.apiUrl}/${operacionId}/notes`,
      { notas }
    );
  }

  /**
   * Obtiene estadísticas
   */
  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  /**
   * Exporta operaciones a CSV
   */
  exportToCsv(filters?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/export/csv`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Exporta operaciones a PDF
   */
  exportToPdf(filters?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/export/pdf`, {
      params,
      responseType: 'blob',
    });
  }
}