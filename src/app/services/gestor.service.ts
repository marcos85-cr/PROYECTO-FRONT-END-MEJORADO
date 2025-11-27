import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GestorStats {
  myClients: number;
  activeAccounts: number;
  todayOperations: number;
  pendingApprovals: number;
  totalVolume: number;
}

export interface ClienteGestor {
  id: string;
  nombre: string;
  email: string;
  identificacion: string;
  telefono: string;
  cuentasActivas: number;
  ultimaOperacion: Date;
  estado: string;
  volumenTotal: number;
}

export interface CuentaCliente {
  id: number;
  numero: string;
  numeroCuenta: string;
  tipo: string;
  moneda: string;
  saldo: number;
  estado: string;
  fechaApertura: Date;
}

export interface OperacionGestor {
  id: string;
  clienteId: string;
  clienteNombre: string;
  tipo: string;
  descripcion: string;
  monto: number;
  moneda: string;
  comision: number;
  estado: string;
  fecha: Date;
  cuentaOrigenNumero: string;
  cuentaDestinoNumero?: string;
  requiereAprobacion: boolean;
  esUrgente: boolean;
}

export interface CrearCuentaRequest {
  tipo: string;
  moneda: string;
  saldoInicial: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  summary?: any;
}

@Injectable({
  providedIn: 'root',
})
export class GestorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // ========== DASHBOARD ==========

  getDashboardStats(): Observable<ApiResponse<GestorStats>> {
    return this.http.get<ApiResponse<GestorStats>>(
      `${this.apiUrl}/gestor/dashboard/stats`,
      { headers: this.getHeaders() }
    );
  }

  getOperacionesPendientes(): Observable<ApiResponse<OperacionGestor[]>> {
    return this.http.get<ApiResponse<OperacionGestor[]>>(
      `${this.apiUrl}/gestor/operaciones-pendientes`,
      { headers: this.getHeaders() }
    );
  }

  // ========== CLIENTES ==========

  getMisClientes(): Observable<ApiResponse<ClienteGestor[]>> {
    return this.http.get<ApiResponse<ClienteGestor[]>>(
      `${this.apiUrl}/gestor/mis-clientes`,
      { headers: this.getHeaders() }
    );
  }

  getDetalleCliente(clienteId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/gestor/clientes/${clienteId}`,
      { headers: this.getHeaders() }
    );
  }

  getCuentasCliente(
    clienteId: string
  ): Observable<ApiResponse<CuentaCliente[]>> {
    return this.http.get<ApiResponse<CuentaCliente[]>>(
      `${this.apiUrl}/gestor/clientes/${clienteId}/cuentas`,
      { headers: this.getHeaders() }
    );
  }

  getTransaccionesCliente(
    clienteId: string,
    filtros?: {
      fechaInicio?: string;
      fechaFin?: string;
      tipo?: string;
      estado?: string;
    }
  ): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();

    if (filtros?.fechaInicio)
      params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.estado) params = params.set('estado', filtros.estado);

    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/gestor/clientes/${clienteId}/transacciones`,
      { headers: this.getHeaders(), params }
    );
  }

  crearCuentaParaCliente(
    clienteId: string,
    request: CrearCuentaRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/gestor/clientes/${clienteId}/cuentas`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // ========== OPERACIONES ==========

  getOperaciones(filtros?: {
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    montoMinimo?: number;
    montoMaximo?: number;
    nombreCliente?: string;
    tipoOperacion?: string;
  }): Observable<ApiResponse<OperacionGestor[]>> {
    let params = new HttpParams();

    if (filtros?.estado && filtros.estado !== 'all')
      params = params.set('estado', filtros.estado);
    if (filtros?.fechaInicio)
      params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros?.montoMinimo)
      params = params.set('montoMinimo', filtros.montoMinimo.toString());
    if (filtros?.montoMaximo)
      params = params.set('montoMaximo', filtros.montoMaximo.toString());
    if (filtros?.nombreCliente)
      params = params.set('nombreCliente', filtros.nombreCliente);
    if (filtros?.tipoOperacion)
      params = params.set('tipoOperacion', filtros.tipoOperacion);

    return this.http.get<ApiResponse<OperacionGestor[]>>(
      `${this.apiUrl}/gestor/operaciones`,
      { headers: this.getHeaders(), params }
    );
  }

  getDetalleOperacion(
    operacionId: string
  ): Observable<ApiResponse<OperacionGestor>> {
    return this.http.get<ApiResponse<OperacionGestor>>(
      `${this.apiUrl}/gestor/operaciones/${operacionId}`,
      { headers: this.getHeaders() }
    );
  }

  aprobarOperacion(operacionId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/gestor/operaciones/${operacionId}/aprobar`,
      {},
      { headers: this.getHeaders() }
    );
  }

  rechazarOperacion(
    operacionId: string,
    razon: string
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/gestor/operaciones/${operacionId}/rechazar`,
      { razon },
      { headers: this.getHeaders() }
    );
  }
}
