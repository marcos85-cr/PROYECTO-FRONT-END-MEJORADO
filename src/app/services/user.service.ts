import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl || 'https://tu-api.com/api'}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios (solo para administrador)
   */
  getAllUsers(filters?: any): Observable<User[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario (solo administrador)
   */
  createUser(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }

  /**
   * Actualiza un usuario
   */
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Bloquea un usuario
   */
  blockUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/block`, {});
  }

  /**
   * Desbloquea un usuario
   */
  unblockUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/unblock`, {});
  }

  /**
   * Verifica si un email ya está registrado
   */
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(
      `${this.apiUrl}/check-email`,
      { email }
    );
  }

  /**
   * Elimina un usuario
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}