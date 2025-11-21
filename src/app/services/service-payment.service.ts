import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  ServiceProvider,
  ServicePayment,
  ServiceType,
  CreateServicePaymentRequest,
  ServicePaymentResponse,
  PaymentStatus,
  CreateServiceProviderRequest,
  CreateServiceProviderResponse,
  ValidationRule,
} from '../models/service-payment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServicePaymentService {
  private apiUrl = `${environment.apiUrl}/service-payments`;

  //  BehaviorSubject para mantener la lista actualizada
  private providersSubject = new BehaviorSubject<ServiceProvider[]>([]);
  public providers$ = this.providersSubject.asObservable();

  // Proveedores de servicios predefinidos
  private serviceProviders: ServiceProvider[] = [
    {
      id: '1',
      nombre: 'AyA',
      tipo: ServiceType.AGUA,
      icon: 'water',
      codigoEmpresa: 'AYA001',
      activo: true,
      validationRules: {
        minLength: 8,
        maxLength: 12,
        allowNumbers: true,
        allowLetters: false,
        customMessage: 'Ingrese un número de contrato válido (8-12 dígitos)',
      },
      descripcion: 'Acueductos y Alcantarillados',
    },
    {
      id: '2',
      nombre: 'ASADA Local',
      tipo: ServiceType.AGUA,
      icon: 'water-outline',
      codigoEmpresa: 'ASADA001',
      activo: true,
      validationRules: {
        minLength: 6,
        maxLength: 10,
        allowNumbers: true,
        allowLetters: false,
      },
      descripcion: 'Asociación Administradora de Acueductos',
    },
    {
      id: '3',
      nombre: 'ICE',
      tipo: ServiceType.ELECTRICIDAD,
      icon: 'flash',
      codigoEmpresa: 'ICE001',
      activo: true,
      validationRules: {
        minLength: 10,
        maxLength: 12,
        allowNumbers: true,
        allowLetters: false,
        customMessage: 'Número de servicio ICE (10-12 dígitos)',
      },
      descripcion: 'Instituto Costarricense de Electricidad',
    },
    {
      id: '4',
      nombre: 'CNFL',
      tipo: ServiceType.ELECTRICIDAD,
      icon: 'flash-outline',
      codigoEmpresa: 'CNFL001',
      activo: true,
      validationRules: {
        minLength: 8,
        maxLength: 10,
        allowNumbers: true,
        allowLetters: false,
      },
      descripcion: 'Compañía Nacional de Fuerza y Luz',
    },
    {
      id: '5',
      nombre: 'Kölbi',
      tipo: ServiceType.TELEFONIA,
      icon: 'phone-portrait',
      codigoEmpresa: 'KOLBI001',
      activo: true,
      validationRules: {
        exactLength: 8,
        allowNumbers: true,
        allowLetters: false,
        customMessage: 'Número de teléfono (8 dígitos)',
      },
      descripcion: 'Telefonía Móvil ICE',
    },
    {
      id: '6',
      nombre: 'Claro',
      tipo: ServiceType.TELEFONIA,
      icon: 'call',
      codigoEmpresa: 'CLARO001',
      activo: true,
      validationRules: {
        exactLength: 8,
        allowNumbers: true,
        allowLetters: false,
      },
      descripcion: 'Claro Costa Rica',
    },
    {
      id: '7',
      nombre: 'Movistar',
      tipo: ServiceType.TELEFONIA,
      icon: 'call-outline',
      codigoEmpresa: 'MOVISTAR001',
      activo: true,
      validationRules: {
        exactLength: 8,
        allowNumbers: true,
        allowLetters: false,
      },
      descripcion: 'Movistar Costa Rica',
    },
    {
      id: '8',
      nombre: 'Municipalidad de San José',
      tipo: ServiceType.MUNICIPALIDADES,
      icon: 'business',
      codigoEmpresa: 'MUNSJ001',
      activo: true,
      validationRules: {
        minLength: 6,
        maxLength: 15,
        allowNumbers: true,
        allowLetters: true,
        customMessage: 'Número de cuenta municipal',
      },
      descripcion: 'Gobierno Local San José',
    },
    {
      id: '9',
      nombre: 'Municipalidad de Alajuela',
      tipo: ServiceType.MUNICIPALIDADES,
      icon: 'business-outline',
      codigoEmpresa: 'MUNAL001',
      activo: true,
      validationRules: {
        minLength: 6,
        maxLength: 15,
        allowNumbers: true,
        allowLetters: true,
      },
      descripcion: 'Gobierno Local Alajuela',
    },
    {
      id: '10',
      nombre: 'Municipalidad de Cartago',
      tipo: ServiceType.MUNICIPALIDADES,
      icon: 'business-outline',
      codigoEmpresa: 'MUNCA001',
      activo: true,
      validationRules: {
        minLength: 6,
        maxLength: 15,
        allowNumbers: true,
        allowLetters: true,
      },
      descripcion: 'Gobierno Local Cartago',
    },
    {
      id: '11',
      nombre: 'Poder Judicial - Cobros',
      tipo: ServiceType.COBRO_JUDICIAL,
      icon: 'document-text',
      codigoEmpresa: 'PJ001',
      activo: true,
      validationRules: {
        minLength: 10,
        maxLength: 20,
        allowNumbers: true,
        allowLetters: true,
        customMessage: 'Número de expediente judicial',
      },
      descripcion: 'Cobros Judiciales',
    },
    {
      id: '12',
      nombre: 'Juzgado de Tránsito',
      tipo: ServiceType.COBRO_JUDICIAL,
      icon: 'document-text-outline',
      codigoEmpresa: 'TRANS001',
      activo: true,
      validationRules: {
        minLength: 8,
        maxLength: 15,
        allowNumbers: true,
        allowLetters: true,
        customMessage: 'Número de boleta o expediente',
      },
      descripcion: 'Multas de Tránsito',
    },
  ];

  constructor(private http: HttpClient) {
    // Inicializar el BehaviorSubject
    this.providersSubject.next(this.serviceProviders);
  }

  /**
   *  Crea un nuevo proveedor de servicios
   */
  createServiceProvider(
    request: CreateServiceProviderRequest
  ): Observable<CreateServiceProviderResponse> {
    return new Observable((observer) => {
      setTimeout(() => {
        // Validar que el código de empresa no exista
        const existingProvider = this.serviceProviders.find(
          (p) => p.codigoEmpresa === request.codigoEmpresa
        );

        if (existingProvider) {
          observer.next({
            success: false,
            message: 'El código de empresa ya existe',
          });
          observer.complete();
          return;
        }

        // Crear nuevo proveedor
        const newProvider: ServiceProvider = {
          id: this.generateId(),
          nombre: request.nombre,
          tipo: request.tipo,
          icon: request.icon,
          codigoEmpresa: request.codigoEmpresa,
          descripcion: request.descripcion,
          activo: true,
          validationRules: request.validationRules || {
            minLength: 8,
            maxLength: 12,
            allowNumbers: true,
            allowLetters: false,
          },
          fechaCreacion: new Date(),
        };

        this.serviceProviders.push(newProvider);
        this.providersSubject.next([...this.serviceProviders]);

        observer.next({
          success: true,
          message: 'Proveedor creado exitosamente',
          provider: newProvider,
        });
        observer.complete();
      }, 500);
    });
  }

  /**
   *  Actualiza un proveedor existente
   */
  updateServiceProvider(
    id: string,
    updates: Partial<ServiceProvider>
  ): Observable<CreateServiceProviderResponse> {
    return new Observable((observer) => {
      setTimeout(() => {
        const index = this.serviceProviders.findIndex((p) => p.id === id);

        if (index === -1) {
          observer.next({
            success: false,
            message: 'Proveedor no encontrado',
          });
          observer.complete();
          return;
        }

        // Actualizar proveedor
        this.serviceProviders[index] = {
          ...this.serviceProviders[index],
          ...updates,
        };

        this.providersSubject.next([...this.serviceProviders]);

        observer.next({
          success: true,
          message: 'Proveedor actualizado exitosamente',
          provider: this.serviceProviders[index],
        });
        observer.complete();
      }, 500);
    });
  }

  /**
   *  Elimina un proveedor
   */
  deleteServiceProvider(
    id: string
  ): Observable<{ success: boolean; message: string }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const index = this.serviceProviders.findIndex((p) => p.id === id);

        if (index === -1) {
          observer.next({
            success: false,
            message: 'Proveedor no encontrado',
          });
          observer.complete();
          return;
        }

        this.serviceProviders.splice(index, 1);
        this.providersSubject.next([...this.serviceProviders]);

        observer.next({
          success: true,
          message: 'Proveedor eliminado exitosamente',
        });
        observer.complete();
      }, 500);
    });
  }

  /**
   *  Valida un número de contrato según las reglas del proveedor
   */
  validateContractNumber(
    providerId: string,
    contractNumber: string
  ): {
    valid: boolean;
    errors: string[];
  } {
    const provider = this.serviceProviders.find((p) => p.id === providerId);

    if (!provider || !provider.validationRules) {
      return { valid: true, errors: [] };
    }

    const rules = provider.validationRules;
    const errors: string[] = [];

    // Validar longitud exacta
    if (rules.exactLength && contractNumber.length !== rules.exactLength) {
      errors.push(`Debe tener exactamente ${rules.exactLength} caracteres`);
    }

    // Validar longitud mínima
    if (rules.minLength && contractNumber.length < rules.minLength) {
      errors.push(`Debe tener al menos ${rules.minLength} caracteres`);
    }

    // Validar longitud máxima
    if (rules.maxLength && contractNumber.length > rules.maxLength) {
      errors.push(`No puede tener más de ${rules.maxLength} caracteres`);
    }

    // Validar solo números
    if (rules.allowNumbers && !rules.allowLetters) {
      if (!/^\d+$/.test(contractNumber)) {
        errors.push('Solo se permiten números');
      }
    }

    // Validar patrón personalizado
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(contractNumber)) {
        errors.push(rules.customMessage || 'Formato inválido');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obtiene todos los proveedores de servicios disponibles
   */
  getServiceProviders(): Observable<ServiceProvider[]> {
    return of(this.serviceProviders.filter((p) => p.activo !== false)).pipe(
      delay(300)
    );
  }

  /**
   * Obtiene proveedores filtrados por tipo de servicio
   */
  getProvidersByType(tipo: ServiceType): Observable<ServiceProvider[]> {
    const filtered = this.serviceProviders.filter(
      (p) => p.tipo === tipo && p.activo !== false
    );
    return of(filtered).pipe(delay(200));
  }

  /**
   * Obtiene un proveedor específico por ID
   */
  getProviderById(id: string): Observable<ServiceProvider | undefined> {
    const provider = this.serviceProviders.find((p) => p.id === id);
    return of(provider).pipe(delay(200));
  }

  /**
   * Realiza un pago de servicio
   */
  makeServicePayment(
    request: CreateServicePaymentRequest
  ): Observable<ServicePaymentResponse> {
    return new Observable((observer) => {
      setTimeout(() => {
        const provider = this.serviceProviders.find(
          (p) => p.id === request.proveedorId
        );

        if (!provider) {
          observer.next({
            success: false,
            message: 'Proveedor no encontrado',
          });
          observer.complete();
          return;
        }

        //  Validar número de contrato
        const validation = this.validateContractNumber(
          request.proveedorId,
          request.numeroReferencia
        );
        if (!validation.valid) {
          observer.next({
            success: false,
            message: `Número de contrato inválido: ${validation.errors.join(
              ', '
            )}`,
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
          descripcion: request.descripcion,
        };

        observer.next({
          success: true,
          message: 'Pago realizado exitosamente',
          payment: payment,
          transaccionId: this.generateTransactionId(),
        });
        observer.complete();
      }, 1500);
    });
  }

  /**
   * Obtiene el historial de pagos de servicios del usuario
   */
  getMyServicePayments(): Observable<ServicePayment[]> {
    return of([]).pipe(delay(300));
  }

  /**
   * Valida un número de referencia con el proveedor
   */
  validateReference(
    proveedorId: string,
    numeroReferencia: string
  ): Observable<{
    valid: boolean;
    monto?: number;
    nombre?: string;
    errors?: string[];
  }> {
    return new Observable((observer) => {
      setTimeout(() => {
        // Primero validar formato según reglas
        const validation = this.validateContractNumber(
          proveedorId,
          numeroReferencia
        );

        if (!validation.valid) {
          observer.next({
            valid: false,
            errors: validation.errors,
          });
          observer.complete();
          return;
        }

        // Si el formato es válido, simular validación con el proveedor
        observer.next({
          valid: true,
          monto: Math.floor(Math.random() * 50000) + 5000,
          nombre: 'Cliente Ejemplo',
        });
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
    return (
      'TRX' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
    );
  }
}
