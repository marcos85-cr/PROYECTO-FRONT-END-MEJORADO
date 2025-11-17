// src/app/services/mock-auth.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserRole,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MockAuthService {
  // Usuarios de prueba predefinidos
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@banco.com',
      role: UserRole.ADMINISTRADOR,
      nombre: 'Administrador Sistema',
      identificacion: '123456789',
      telefono: '+506 8888-8888',
      bloqueado: false,
      intentosFallidos: 0,
    },
    {
      id: '2',
      email: 'gestor@banco.com',
      role: UserRole.GESTOR,
      nombre: 'María González',
      identificacion: '987654321',
      telefono: '+506 7777-7777',
      bloqueado: false,
      intentosFallidos: 0,
    },
    {
      id: '3',
      email: 'cliente@banco.com',
      role: UserRole.CLIENTE,
      nombre: 'Marcos Vargas',
      identificacion: '456789123',
      telefono: '+506 6666-6666',
      bloqueado: false,
      intentosFallidos: 0,
    },
    {
      id: '4',
      email: 'juan.perez@email.com',
      role: UserRole.CLIENTE,
      nombre: 'Juan Pérez',
      identificacion: '111222333',
      telefono: '+506 5555-5555',
      bloqueado: false,
      intentosFallidos: 0,
    },
    {
      id: '5',
      email: 'maria.lopez@email.com',
      role: UserRole.CLIENTE,
      nombre: 'María López',
      identificacion: '444555666',
      telefono: '+506 4444-4444',
      bloqueado: false,
      intentosFallidos: 0,
    },
  ];

  // Contraseña por defecto para todos los usuarios de prueba
  private defaultPassword = '123456';

  // Secret key para generar JWT (en producción esto estaría en el backend)
  private readonly JWT_SECRET = 'mock-jwt-secret-key-2025';

  // ⏰ CONFIGURACIÓN DE EXPIRACIÓN: 20 MINUTOS
  private readonly TOKEN_EXPIRATION_SECONDS = 20 * 60; // 20 minutos en segundos

  /**
   * Genera un JWT token mock con expiración de 20 minutos
   */
  private generateJWT(user: User): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      iat: now, // Issued at (tiempo actual)
      exp: now + this.TOKEN_EXPIRATION_SECONDS, // Expira en 20 minutos
    };

    // Simulación de JWT (no es un JWT real, solo para desarrollo)
    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    const signature = btoa(
      `${base64Header}.${base64Payload}.${this.JWT_SECRET}`
    );

    const token = `${base64Header}.${base64Payload}.${signature}`;

    // Log para debug
    console.log('🔑 Token generado:');
    console.log('  - Emitido en:', new Date(now * 1000).toLocaleTimeString());
    console.log(
      '  - Expira en:',
      new Date(payload.exp * 1000).toLocaleTimeString()
    );
    console.log('  - Duración: 20 minutos');

    return token;
  }

  /**
   * Decodifica y valida un JWT token mock
   */
  public validateToken(token: string): { valid: boolean; payload?: any } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false };
      }

      const payload = JSON.parse(atob(parts[1]));

      // Verificar expiración
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.warn('⚠️ Token expirado:', {
          expiredAt: new Date(payload.exp * 1000).toLocaleString(),
          now: new Date(currentTime * 1000).toLocaleString(),
        });
        return { valid: false };
      }

      return { valid: true, payload };
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return { valid: false };
    }
  }

  /**
   * Login con generación de JWT (20 minutos de expiración)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return of(credentials).pipe(
      delay(1000), // Simular latencia de red
      map(() => {
        const user = this.mockUsers.find((u) => u.email === credentials.email);

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        if (credentials.password !== this.defaultPassword) {
          throw new Error('Contraseña incorrecta');
        }

        if (user.bloqueado) {
          throw new Error('Usuario bloqueado. Contacte al administrador.');
        }

        // Generar JWT token con 20 minutos de expiración
        const token = this.generateJWT(user);

        console.log('✅ Login exitoso');
        console.log('👤 Usuario:', user.nombre, `(${user.role})`);
        console.log('⏰ Token válido por: 20 minutos');

        return {
          token,
          user,
          expiresIn: this.TOKEN_EXPIRATION_SECONDS, // 20 minutos en segundos
        };
      })
    );
  }

  /**
   * Registro de nuevo usuario
   */
  register(data: RegisterRequest): Observable<any> {
    return of(data).pipe(
      delay(800),
      map(() => {
        // Verificar si el usuario ya existe
        const existingUser = this.mockUsers.find((u) => u.email === data.email);
        if (existingUser) {
          throw new Error('El correo electrónico ya está registrado');
        }

        // Validar que las contraseñas coincidan
        if (data.password !== data.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        // Crear nuevo usuario
        const newUser: User = {
          id: (this.mockUsers.length + 1).toString(),
          email: data.email,
          role: data.role || UserRole.CLIENTE,
          nombre: data.nombre,
          identificacion: data.identificacion,
          telefono: data.telefono,
          bloqueado: false,
          intentosFallidos: 0,
        };

        this.mockUsers.push(newUser);

        console.log('✅ Usuario registrado:', newUser.nombre);

        return {
          message: 'Usuario registrado exitosamente',
          user: newUser,
        };
      })
    );
  }

  /**
   * Obtiene el usuario desde un token JWT
   */
  getUserFromToken(token: string): User | null {
    const validation = this.validateToken(token);

    if (!validation.valid || !validation.payload) {
      return null;
    }

    const user = this.mockUsers.find((u) => u.id === validation.payload.sub);
    return user || null;
  }

  /**
   * Verifica si un token es válido
   */
  isTokenValid(token: string): boolean {
    return this.validateToken(token).valid;
  }

  /**
   * Obtiene todos los usuarios (útil para testing)
   */
  getAllUsers(): User[] {
    return this.mockUsers;
  }

  /**
   * Agregar usuarios personalizados
   */
  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: (this.mockUsers.length + 1).toString(),
    };
    this.mockUsers.push(newUser);
    return newUser;
  }

  /**
   * Actualiza los intentos fallidos de login
   */
  updateFailedAttempts(email: string, increment: boolean = true): void {
    const user = this.mockUsers.find((u) => u.email === email);
    if (user) {
      if (increment) {
        user.intentosFallidos++;
        if (user.intentosFallidos >= 3) {
          user.bloqueado = true;
          user.fechaBloqueo = new Date();
        }
      } else {
        user.intentosFallidos = 0;
      }
    }
  }

  /**
   * Desbloquea un usuario
   */
  unlockUser(email: string): void {
    const user = this.mockUsers.find((u) => u.email === email);
    if (user) {
      user.bloqueado = false;
      user.intentosFallidos = 0;
      user.fechaBloqueo = undefined;
    }
  }

  /**
   * Obtiene el tiempo de expiración configurado
   */
  getTokenExpirationTime(): number {
    return this.TOKEN_EXPIRATION_SECONDS;
  }
}
