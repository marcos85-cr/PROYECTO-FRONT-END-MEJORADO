export interface Client {
  id: string;
  identificacion: string;      // Única
  nombre: string;
  telefono: string;
  correo: string;
  estado?: 'Activo' | 'Inactivo';
  cuentasActivas?: number;
  saldoTotal?: number;
  ultimaOperacion?: Date;
  fechaRegistro?: Date;
}

export interface CreateClientRequest {
  identificacion: string;
  nombre: string;
  telefono: string;
  correo: string;
}

export interface UpdateClientRequest {
  nombre?: string;
  telefono?: string;
  correo?: string;
}
