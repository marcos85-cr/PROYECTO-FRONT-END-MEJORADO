// Mock Auth Service - Para desarrollo y pruebas
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  UserRole 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
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
      intentosFallidos: 0
    },
    {
      id: '2',
      email: 'gestor@banco.com',
      role: UserRole.GESTOR,
      nombre: 'María González',
      identificacion: '987654321',
      telefono: '+506 7777-7777',
      bloqueado: false,
      intentosFallidos: 0
    },
    {
      id: '3',
      email: 'cliente@banco.com',
      role: UserRole.CLIENTE,
      nombre: 'Marcos Vargas',
      identificacion: '456789123',
      telefono: '+506 6666-6666',
      bloqueado: false,
      intentosFallidos: 0
    },
    {
      id: '4',
      email: 'juan.perez@email.com',
      role: UserRole.CLIENTE,
      nombre: 'Juan Pérez',
      identificacion: '111222333',
      telefono: '+506 5555-5555',
      bloqueado: false,
      intentosFallidos: 0
    },
    {
      id: '5',
      email: 'maria.lopez@email.com',
      role: UserRole.CLIENTE,
      nombre: 'María López',
      identificacion: '444555666',
      telefono: '+506 4444-4444',
      bloqueado: false,
      intentosFallidos: 0
    }
  ];

  // Contraseña por defecto para todos los usuarios de prueba
  private defaultPassword = '123456';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return of(credentials).pipe(
      delay(1000), // Simular latencia de red
      map(() => {
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        if (credentials.password !== this.defaultPassword) {
          throw new Error('Contraseña incorrecta');
        }

        if (user.bloqueado) {
          throw new Error('Usuario bloqueado');
        }

        // Generar token simulado
        const token = `mock-jwt-token-${user.id}-${Date.now()}`;
        
        return {
          token,
          user,
          expiresIn: 3600
        };
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return of(data).pipe(
      delay(800),
      map(() => {
        // Verificar si el usuario ya existe
        const existingUser = this.mockUsers.find(u => u.email === data.email);
        if (existingUser) {
          throw new Error('El usuario ya existe');
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
          intentosFallidos: 0
        };

        this.mockUsers.push(newUser);
        
        return { message: 'Usuario registrado exitosamente' };
      })
    );
  }

  // Método para obtener todos los usuarios (útil para testing)
  getAllUsers(): User[] {
    return this.mockUsers;
  }

  // Método para agregar usuarios personalizados
  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: (this.mockUsers.length + 1).toString()
    };
    this.mockUsers.push(newUser);
    return newUser;
  }
}