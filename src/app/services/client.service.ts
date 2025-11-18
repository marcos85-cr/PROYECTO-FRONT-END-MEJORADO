import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl || 'https://tu-api.com/api'}/clients`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los clientes (admin)
   */
  getAllClients(filters?: any): Observable<Client[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Client[]>(this.apiUrl, { params });
  }

  /**
   * Obtiene mi perfil (cliente actual)
   */
  getMyProfile(): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/me`);
  }

  /**
   * Obtiene un cliente por ID
   */
  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene un cliente por identificacion
   */
  getClientByIdentification(identificacion: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/search/by-id/${identificacion}`);
  }

  /**
   * Crea un nuevo cliente
   */
  createClient(data: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, data);
  }

  /**
   * Actualiza datos del cliente
   */
  updateClient(id: string, data: UpdateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Actualiza mi perfil
   */
  updateMyProfile(data: UpdateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/me`, data);
  }

  /**
   * Verifica si una identificacion ya existe
   */
  checkIdentificationExists(identificacion: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(
      `${this.apiUrl}/check-identification`,
      { identificacion }
    );
  }

  /**
   * Verifica si un correo ya existe
   */
  checkEmailExists(correo: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(
      `${this.apiUrl}/check-email`,
      { correo }
    );
  }

  /**
   * Elimina un cliente
   */
  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}