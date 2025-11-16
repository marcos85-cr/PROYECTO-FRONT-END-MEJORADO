
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
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
  private useMockService = true;
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private mockAuthService: MockAuthService,
    private router: Router
  ) {
    const storedUser = this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();

    // Iniciar timer de expiración si hay usuario
    if (storedUser) {
      this.autoLogout();
    }
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
      const validation = this.mockAuthService.validateToken(token);
      if (!validation.valid) {
        console.warn('⚠️ Token inválido o expirado al cargar');
        this.clearStorage();
        return null;
      }

      // Verificar expiración
      if (validation.payload && validation.payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (validation.payload.exp < now) {
          console.warn('⚠️ Token expirado al cargar');
          this.clearStorage();
          return null;
        }
      }
    }

    try {
      const user = JSON.parse(storedUser);
      console.log('✅ Usuario cargado desde localStorage:', user.nombre);
      return user;
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
      return this.mockAuthService.login(credentials).pipe(
        tap((response) => this.handleLoginSuccess(response)),
        catchError((error) => {
          console.error('❌ Error en login:', error);
          return throwError(() => error);
        })
      );
    }

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => this.handleLoginSuccess(response)),
        catchError((error: HttpErrorResponse) => {
          console.warn('⚠️ Backend no disponible, usando servicio mock');
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

    // Calcular y guardar tiempo de expiración
    if (response.expiresIn) {
      const expirationTime = Date.now() + response.expiresIn * 1000;
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    }

    // Actualizar BehaviorSubject
    this.currentUserSubject.next(response.user);

    // Configurar auto-logout
    this.autoLogout();

    console.log('✅ Login exitoso');
    console.log('🔑 Token almacenado');
    console.log('👤 Usuario:', response.user.nombre);
    console.log('🎭 Rol:', response.user.role);
    console.log('⏰ Expira en:', response.expiresIn, 'segundos');
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
        console.warn('⚠️ Backend no disponible, usando servicio mock');
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

    // Limpiar timer de auto-logout
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    console.log('👋 Sesión cerrada');
    this.router.navigate(['/login']);
  }

  /**
   * Auto-logout cuando el token expira
   */
  private autoLogout(): void {
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (!expirationTime) {
      return;
    }

    const expTime = parseInt(expirationTime, 10);
    const now = Date.now();
    const timeUntilExpiration = expTime - now;

    if (timeUntilExpiration <= 0) {
      console.warn('⚠️ Token ya expirado');
      this.logout();
      return;
    }

    // Limpiar timer anterior si existe
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    // Configurar nuevo timer
    this.tokenExpirationTimer = setTimeout(() => {
      console.warn('⏰ Token expirado - cerrando sesión automáticamente');
      this.logout();
    }, timeUntilExpiration);

    console.log(
      '⏰ Auto-logout configurado para:',
      new Date(expTime).toLocaleTimeString()
    );
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
      console.warn('⚠️ Token expirado - limpiando sesión');
      this.logout();
      return false;
    }

    // Verificar validez del token con el mock service
    if (this.useMockService) {
      const validation = this.mockAuthService.validateToken(token);
      if (!validation.valid) {
        console.warn('⚠️ Token inválido - limpiando sesión');
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
    const isExpired = Date.now() > expTime;

    if (isExpired) {
      console.warn('⚠️ Token expirado detectado');
    }

    return isExpired;
  }

  /**
   * Obtiene el token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decodifica el token JWT
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
   * Obtiene información del token
   */
  getTokenInfo(): {
    expiresIn: number;
    isExpired: boolean;
    expiresAt: Date;
  } | null {
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
      expiresAt: new Date(expTime),
    };
  }

  /**
   * Verifica el estado del token y muestra información de debug
   */
  debugTokenStatus(): void {
    console.log('🔍 === DEBUG TOKEN STATUS ===');
    const token = this.getToken();
    console.log('Token existe:', !!token);

    if (token) {
      const validation = this.mockAuthService.validateToken(token);
      console.log('Token válido:', validation.valid);

      if (validation.payload) {
        console.log('Payload:', validation.payload);
        const exp = validation.payload.exp;
        const now = Math.floor(Date.now() / 1000);
        console.log('Expira en:', exp - now, 'segundos');
        console.log('Fecha expiración:', new Date(exp * 1000).toLocaleString());
      }
    }

    const tokenInfo = this.getTokenInfo();
    if (tokenInfo) {
      console.log('Token info:', tokenInfo);
    }

    console.log('Usuario actual:', this.currentUserValue);
    console.log('Autenticado:', this.isAuthenticated());
    console.log('=========================');
  }
}
