export enum ServiceType {
  AGUA = 'Agua',
  ELECTRICIDAD = 'Electricidad',
  TELEFONIA = 'Telefonía',
  INTERNET = 'Internet',
  CABLE = 'Cable',
  SEGURO = 'Seguro',
  MUNICIPALIDADES = 'Municipalidades',
  COBRO_JUDICIAL = 'Cobro Judicial',
  OTROS = 'Otros',
}

export interface ServiceProvider {
  id: string;
  nombre: string;
  tipo: ServiceType;
  icon?: string;
  codigoValidacion: string; // Ejemplo: "8-12 dígitos"
  regex: string; // Patrón regex como string
  activo: boolean;
  creadoPor?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface CreateProviderRequest {
  nombre: string;
  tipo: ServiceType;
  icon?: string;
  codigoValidacion: string;
  regex: string;
  activo: boolean;
}

export interface UpdateProviderRequest {
  nombre?: string;
  tipo?: ServiceType;
  icon?: string;
  codigoValidacion?: string;
  regex?: string;
  activo?: boolean;
}
