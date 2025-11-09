
export enum AccountType {
  AHORROS = 'Ahorros',
  CORRIENTE = 'Corriente',
  INVERSION = 'Inversión',
  PLAZO_FIJO = 'Plazo fijo',
}

export enum Currency {
  CRC = 'CRC',
  USD = 'USD',
}

export enum AccountStatus {
  ACTIVA = 'Activa',
  BLOQUEADA = 'Bloqueada',
  CERRADA = 'Cerrada',
}

export interface Account {
  id: string;
  numeroCuenta: string;
  tipo: AccountType;
  moneda: Currency;
  saldo: number;
  estado: AccountStatus;
  clienteId: string;
  clienteNombre?: string;
  fechaApertura: Date;
  limiteDiario: number;
  saldoDisponible: number;
}

export interface CreateAccountRequest {
  clienteId: string;
  tipo: AccountType;
  moneda: Currency;
  saldoInicial: number;
}