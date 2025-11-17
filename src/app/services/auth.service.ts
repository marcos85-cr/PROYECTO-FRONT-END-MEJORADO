
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockAuthService } from './mock-auth.service';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'https://tu-api.com/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private useMockService = true; // Cambiar a false cuando tengas el backend

  constructor(
    private http: HttpClient,
    private mockAuthService: MockAuthService
  ) {
    // Inicializar desde localStorage
    const storedUser = this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Carga el usuario desde localStorage verificando el token
   */
  private loadUserFromStorage(): User | null {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');

    if (!token || !storedUser) {
      return null;
    }

    // Verificar validez del token
    if (this.useMockService) {
      const isValid = this.mockAuthService.isTokenValid(token);
      if (!isValid) {
        // Token expirado o inválido, limpiar storage
        this.clearStorage();
        return null;
      }
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      this.clearStorage();
      return null;
    }
  }

  /**
   * Login con JWT
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    if (this.useMockService) {
      return this.mockAuthService
        .login(credentials)
        .pipe(tap((response) => this.handleLoginSuccess(response)));
    }

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => this.handleLoginSuccess(response)),
        catchError((error: HttpErrorResponse) => {
          console.warn('Backend no disponible, usando servicio mock');
          this.useMockService = true;
          return this.mockAuthService
            .login(credentials)
            .pipe(tap((response) => this.handleLoginSuccess(response)));
        })
      );
  }

  /**
   * Maneja el éxito del login
   */
  private handleLoginSuccess(response: LoginResponse): void {
    // Guardar token y usuario
    localStorage.setItem('token', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));

    // Guardar tiempo de expiración
    if (response.expiresIn) {
      const expirationTime = Date.now() + response.expiresIn * 1000;
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    }

    // Actualizar BehaviorSubject
    this.currentUserSubject.next(response.user);

    console.log('✅ Login exitoso');
    console.log('🔑 Token almacenado:', response.token);
    console.log('👤 Usuario:', response.user.nombre);
    console.log('🎭 Rol:', response.user.role);
  }

  /**
   * Registro de usuario
   */
  register(data: RegisterRequest): Observable<any> {
    if (this.useMockService) {
      return this.mockAuthService.register(data);
    }

    return this.http.post(`${this.apiUrl}/auth/register`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        console.warn('Backend no disponible, usando servicio mock');
        this.useMockService = true;
        return this.mockAuthService.register(data);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    console.log('👋 Sesión cerrada');
  }

  /**
   * Limpia el almacenamiento
   */
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('tokenExpiration');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Verificar expiración del token
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    // Verificar validez del token con el mock service
    if (this.useMockService) {
      const isValid = this.mockAuthService.isTokenValid(token);
      if (!isValid) {
        this.logout();
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (!expirationTime) {
      return false;
    }

    const expTime = parseInt(expirationTime, 10);
    return Date.now() > expTime;
  }

  /**
   * Obtiene el token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decodifica el token JWT (solo para mock service)
   */
  decodeToken(): any {
    const token = this.getToken();
    if (!token || !this.useMockService) {
      return null;
    }

    const validation = this.mockAuthService.validateToken(token);
    return validation.valid ? validation.payload : null;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'Administrador';
  }

  /**
   * Verifica si el usuario es gestor
   */
  isGestor(): boolean {
    return this.getUserRole() === 'Gestor';
  }

  /**
   * Verifica si el usuario es cliente
   */
  isCliente(): boolean {
    return this.getUserRole() === 'Cliente';
  }

  /**
   * Refresca el token (solo para desarrollo con mock)
   */
  refreshToken(): Observable<LoginResponse> | null {
    if (!this.useMockService) {
      return null;
    }

    const user = this.currentUserValue;
    if (!user) {
      return null;
    }

    // Simular refresh token generando uno nuevo
    const credentials: LoginRequest = {
      email: user.email,
      password: '123456', // En producción esto vendría del refresh token
    };

    return this.mockAuthService
      .login(credentials)
      .pipe(tap((response) => this.handleLoginSuccess(response)));
  }

  /**
   * Obtiene información del token
   */
  getTokenInfo(): { expiresIn: number; isExpired: boolean } | null {
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (!expirationTime) {
      return null;
    }

    const expTime = parseInt(expirationTime, 10);
    const now = Date.now();
    const expiresIn = Math.max(0, expTime - now);

    return {
      expiresIn: Math.floor(expiresIn / 1000), // en segundos
      isExpired: expiresIn <= 0,
    };
  }
}
