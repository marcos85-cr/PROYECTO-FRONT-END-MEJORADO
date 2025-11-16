// src/app/interceptors/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Obtener token JWT
    const token = this.authService.getToken();

    // Clonar request y agregar Authorization header si existe token
    if (token && !this.authService.isTokenExpired()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token inválido o expirado
          console.warn('🚫 Token inválido o expirado (401)');
          this.handleUnauthorized();
        } else if (error.status === 403) {
          // Sin permisos
          console.warn('🚫 Sin permisos para esta acción (403)');
          this.showToast('No tiene permisos para realizar esta acción.');
        } else if (error.status === 0) {
          // Error de conexión
          console.warn('⚠️ Error de conexión');
          this.showToast('Error de conexión. Verifique su internet.');
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Maneja errores de autenticación 401
   */
  private handleUnauthorized(): void {
    // Limpiar sesión
    this.authService.logout();

    // Redirigir a login
    this.router.navigate(['/login']);

    // Mostrar mensaje
    this.showToast('Sesión expirada. Por favor inicie sesión nuevamente.');
  }

  /**
   * Muestra un toast con el mensaje
   */
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
    });
    toast.present();
  }
}
