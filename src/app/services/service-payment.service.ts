import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  ServiceProvider, 
  ServicePayment, 
  ServiceType,
  CreateServicePaymentRequest,
  ServicePaymentResponse,
  PaymentStatus 
} from '../models/service-payment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServicePaymentService {
  private apiUrl = `${environment.apiUrl}/service-payments`;

  // Proveedores de servicios disponibles
  private serviceProviders: ServiceProvider[] = [
    {
      id: '1',
      nombre: 'AyA (Acueductos y Alcantarillados)',
      tipo: ServiceType.AGUA,
      icon: 'water',
      codigoEmpresa: 'AYA001'
    },
    {
      id: '2',
      nombre: 'ASADA Local',
      tipo: ServiceType.AGUA,
      icon: 'water-outline',
      codigoEmpresa: 'ASADA001'
    },
    {
      id: '3',
      nombre: 'ICE (Instituto Costarricense de Electricidad)',
      tipo: ServiceType.ELECTRICIDAD,
      icon: 'flash',
      codigoEmpresa: 'ICE001'
    },
    {
      id: '4',
      nombre: 'CNFL (Compañía Nacional de Fuerza y Luz)',
      tipo: ServiceType.ELECTRICIDAD,
      icon: 'flash-outline',
      codigoEmpresa: 'CNFL001'
    },
    {
      id: '5',
      nombre: 'Kölbi',
      tipo: ServiceType.TELEFONIA,
      icon: 'phone-portrait',
      codigoEmpresa: 'KOLBI001'
    },
    {
      id: '6',
      nombre: 'Claro',
      tipo: ServiceType.TELEFONIA,
      icon: 'call',
      codigoEmpresa: 'CLARO001'
    },
    {
      id: '7',
      nombre: 'Movistar',
      tipo: ServiceType.TELEFONIA,
      icon: 'call-outline',
      codigoEmpresa: 'MOVISTAR001'
    },
    {
      id: '8',
      nombre: 'Municipalidad de San José',
      tipo: ServiceType.MUNICIPALIDADES,
      icon: 'business',
      codigoEmpresa: 'MUNSJ001'
    },
    {
      id: '9',
      nombre: 'Municipalidad de Alajuela',
      tipo: ServiceType.MUNICIPALIDADES,
      icon: 'business-outline',
      codigoEmpresa: 'MUNAL001'
    },
    {
      id: '10',
      nombre: 'Municipalidad de Cartago',
      tipo: ServiceType.MUNICIPALIDADES,
      icon: 'business-outline',
      codigoEmpresa: 'MUNCA001'
    },
    {
      id: '11',
      nombre: 'Poder Judicial - Cobros',
      tipo: ServiceType.COBRO_JUDICIAL,
      icon: 'document-text',
      codigoEmpresa: 'PJ001'
    },
    {
      id: '12',
      nombre: 'Juzgado de Tránsito',
      tipo: ServiceType.COBRO_JUDICIAL,
      icon: 'document-text-outline',
      codigoEmpresa: 'TRANS001'
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los proveedores de servicios disponibles
   */
  getServiceProviders(): Observable<ServiceProvider[]> {
    // En producción, esto vendría del backend
    // return this.http.get<ServiceProvider[]>(`${this.apiUrl}/providers`);
    return of(this.serviceProviders).pipe(delay(300));
  }

  /**
   * Obtiene proveedores filtrados por tipo de servicio
   */
  getProvidersByType(tipo: ServiceType): Observable<ServiceProvider[]> {
    const filtered = this.serviceProviders.filter(p => p.tipo === tipo);
    return of(filtered).pipe(delay(200));
  }

  /**
   * Obtiene un proveedor específico por ID
   */
  getProviderById(id: string): Observable<ServiceProvider | undefined> {
    const provider = this.serviceProviders.find(p => p.id === id);
    return of(provider).pipe(delay(200));
  }

  /**
   * Realiza un pago de servicio
   */
  makeServicePayment(request: CreateServicePaymentRequest): Observable<ServicePaymentResponse> {
    // En producción, esto sería una llamada al backend
    // return this.http.post<ServicePaymentResponse>(`${this.apiUrl}`, request);
    
    // Simulación para desarrollo
    return new Observable(observer => {
      setTimeout(() => {
        const provider = this.serviceProviders.find(p => p.id === request.proveedorId);
        
        if (!provider) {
          observer.next({
            success: false,
            message: 'Proveedor no encontrado'
          });
          observer.complete();
          return;
        }

        const payment: ServicePayment = {
          id: this.generateId(),
          clienteId: 'current-user-id',
          cuentaOrigenId: request.cuentaOrigenId,
          proveedor: provider,
          numeroReferencia: request.numeroReferencia,
          monto: request.monto,
          fecha: new Date(),
          estado: PaymentStatus.COMPLETADO,
          descripcion: request.descripcion
        };

        observer.next({
          success: true,
          message: 'Pago realizado exitosamente',
          payment: payment,
          transaccionId: this.generateTransactionId()
        });
        observer.complete();
      }, 1500);
    });
  }

  /**
   * Obtiene el historial de pagos de servicios del usuario
   */
  getMyServicePayments(): Observable<ServicePayment[]> {
    // En producción: return this.http.get<ServicePayment[]>(`${this.apiUrl}/my-payments`);
    return of([]).pipe(delay(300));
  }

  /**
   * Valida un número de referencia con el proveedor
   */
  validateReference(proveedorId: string, numeroReferencia: string): Observable<{ valid: boolean; monto?: number; nombre?: string }> {
    // En producción, esto consultaría al backend que validaría con el proveedor real
    // return this.http.post<any>(`${this.apiUrl}/validate`, { proveedorId, numeroReferencia });
    
    return new Observable(observer => {
      setTimeout(() => {
        // Simulación de validación
        if (numeroReferencia.length >= 8) {
          observer.next({
            valid: true,
            monto: Math.floor(Math.random() * 50000) + 5000,
            nombre: 'Cliente Ejemplo'
          });
        } else {
          observer.next({ valid: false });
        }
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Descarga el comprobante de pago
   */
  downloadReceipt(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${paymentId}/receipt`, {
      responseType: 'blob',
    });
  }

  // Métodos auxiliares privados
  private generateId(): string {
    return 'SP' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  private generateTransactionId(): string {
    return 'TRX' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}
