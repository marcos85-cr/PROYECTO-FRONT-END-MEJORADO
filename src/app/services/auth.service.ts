


import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockAuthService } from './mock-auth.service';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
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
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    if (this.useMockService) {
      return this.mockAuthService.login(credentials).pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError((error: HttpErrorResponse) => {
          console.warn('Backend no disponible, usando servicio mock');
          this.useMockService = true;
          return this.mockAuthService.login(credentials).pipe(
            tap(response => {
              localStorage.setItem('token', response.token);
              localStorage.setItem('currentUser', JSON.stringify(response.user));
              this.currentUserSubject.next(response.user);
            })
          );
        })
      );
  }

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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Administrador';
  }

  isGestor(): boolean {
    return this.getUserRole() === 'Gestor';
  }

  isCliente(): boolean {
    return this.getUserRole() === 'Cliente';
  }
}