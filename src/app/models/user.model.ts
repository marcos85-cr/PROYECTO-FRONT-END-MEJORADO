export enum UserRole {
  ADMINISTRADOR = 'Administrador',
  GESTOR = 'Gestor',
  CLIENTE = 'Cliente',
}

export interface User {
  id: string;
  email: string;
  role: UserRole | string; // Permitir string también
  nombre: string;
  identificacion?: string; // ✅ Hacer opcional con ?
  telefono?: string; // ✅ Hacer opcional con ?
  bloqueado: boolean;
  intentosFallidos: number;
  fechaBloqueo?: Date;
  cuentasActivas?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  identificacion: string;
  telefono: string;
  role: UserRole | string; // ✅ Permitir string también
}
