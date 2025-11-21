import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {ServiceProvider,CreateProviderRequest,UpdateProviderRequest,
  } from '../models/service-provider.model';
import { environment } from '../../environments/environment';
  
  


@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private apiUrl = `${environment.apiUrl}/api/providers`;

  // Proveedores simulados (mock data) - se usarán hasta conectar con backend
  private mockProviders: ServiceProvider[] = [
    {
      id: '1',
      nombre: 'ICE - Electricidad',
      tipo: 'Electricidad' as any,
      icon: 'flash-outline',
      codigoValidacion: '8-12 dígitos',
      regex: '^\\d{8,12}$',
      activo: true,
      creadoPor: 'admin@banco.com',
      fechaCreacion: new Date('2024-01-15'),
    },
    {
      id: '2',
      nombre: 'AyA - Agua',
      tipo: 'Agua' as any,
      icon: 'water-outline',
      codigoValidacion: '10 dígitos',
      regex: '^\\d{10}$',
      activo: true,
      creadoPor: 'admin@banco.com',
      fechaCreacion: new Date('2024-01-15'),
    },
    {
      id: '3',
      nombre: 'Kolbi',
      tipo: 'Telefonía' as any,
      icon: 'call-outline',
      codigoValidacion: '8 dígitos',
      regex: '^\\d{8}$',
      activo: true,
      creadoPor: 'admin@banco.com',
      fechaCreacion: new Date('2024-02-10'),
    },
    {
      id: '4',
      nombre: 'Tigo Internet',
      tipo: 'Internet' as any,
      icon: 'wifi-outline',
      codigoValidacion: '8-10 dígitos',
      regex: '^\\d{8,10}$',
      activo: true,
      creadoPor: 'admin@banco.com',
      fechaCreacion: new Date('2024-03-05'),
    },
    {
      id: '5',
      nombre: 'Cabletica',
      tipo: 'Cable' as any,
      icon: 'tv-outline',
      codigoValidacion: '12 dígitos',
      regex: '^\\d{12}$',
      activo: false,
      creadoPor: 'admin@banco.com',
      fechaCreacion: new Date('2024-04-20'),
    },
  ];

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los proveedores
   */
  getAllProviders(): Observable<ServiceProvider[]> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.get<ServiceProvider[]>(this.apiUrl);

    // Mock data temporal
    return of([...this.mockProviders]);
  }

  /**
   * Obtener solo proveedores activos (para clientes)
   */
  getActiveProviders(): Observable<ServiceProvider[]> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.get<ServiceProvider[]>(`${this.apiUrl}/active`);

    // Mock data temporal
    const activeProviders = this.mockProviders.filter((p) => p.activo);
    return of(activeProviders);
  }

  /**
   * Obtener un proveedor por ID
   */
  getProviderById(id: string): Observable<ServiceProvider | null> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.get<ServiceProvider>(`${this.apiUrl}/${id}`);

    // Mock data temporal
    const provider = this.mockProviders.find((p) => p.id === id);
    return of(provider || null);
  }

  /**
   * Crear un nuevo proveedor (solo admin)
   */
  createProvider(request: CreateProviderRequest): Observable<ServiceProvider> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.post<ServiceProvider>(this.apiUrl, request);

    // Mock data temporal
    const newProvider: ServiceProvider = {
      id: (this.mockProviders.length + 1).toString(),
      ...request,
      creadoPor: 'admin@banco.com',
      fechaCreacion: new Date(),
    };

    this.mockProviders.push(newProvider);
    return of(newProvider);
  }

  /**
   * Actualizar un proveedor existente
   */
  updateProvider(
    id: string,
    request: UpdateProviderRequest
  ): Observable<ServiceProvider> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.put<ServiceProvider>(`${this.apiUrl}/${id}`, request);

    // Mock data temporal
    const index = this.mockProviders.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockProviders[index] = {
        ...this.mockProviders[index],
        ...request,
        fechaActualizacion: new Date(),
      };
      return of(this.mockProviders[index]);
    }
    throw new Error('Proveedor no encontrado');
  }

  /**
   * Eliminar un proveedor
   */
  deleteProvider(
    id: string
  ): Observable<{ success: boolean; message: string }> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);

    // Mock data temporal
    const index = this.mockProviders.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockProviders.splice(index, 1);
      return of({
        success: true,
        message: 'Proveedor eliminado correctamente',
      });
    }
    return of({ success: false, message: 'Proveedor no encontrado' });
  }

  /**
   * Activar/Desactivar un proveedor
   */
  toggleProviderStatus(
    id: string,
    activo: boolean
  ): Observable<ServiceProvider> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.patch<ServiceProvider>(`${this.apiUrl}/${id}/status`, { activo });

    // Mock data temporal
    const index = this.mockProviders.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockProviders[index].activo = activo;
      this.mockProviders[index].fechaActualizacion = new Date();
      return of(this.mockProviders[index]);
    }
    throw new Error('Proveedor no encontrado');
  }

  /**
   * Validar un número de contrato según el regex del proveedor
   */
  validateContractNumber(
    providerId: string,
    contractNumber: string
  ): Observable<boolean> {
    // TODO: Descomentar cuando el backend esté listo
    // return this.http.post<boolean>(`${this.apiUrl}/${providerId}/validate`, { contractNumber });

    // Mock data temporal
    const provider = this.mockProviders.find((p) => p.id === providerId);
    if (provider) {
      const regex = new RegExp(provider.regex);
      return of(regex.test(contractNumber));
    }
    return of(false);
  }
}
