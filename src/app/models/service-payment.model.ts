export enum ServiceType {
  AGUA = 'Agua',
  ELECTRICIDAD = 'Electricidad',
  TELEFONIA = 'Telefonía',
  MUNICIPALIDADES = 'Municipalidades',
  COBRO_JUDICIAL = 'Cobro Judicial',
}

export interface ServiceProvider {
  id: string;
  nombre: string;
  tipo: ServiceType;
  icon: string;
  codigoEmpresa: string;
}

export interface ServicePayment {
  id: string;
  clienteId: string;
  cuentaOrigenId: string;
  proveedor: ServiceProvider;
  numeroReferencia: string;
  monto: number;
  fecha: Date;
  estado: PaymentStatus;
  descripcion?: string;
}

export enum PaymentStatus {
  PENDIENTE = 'Pendiente',
  PROCESANDO = 'Procesando',
  COMPLETADO = 'Completado',
  RECHAZADO = 'Rechazado',
}

export interface CreateServicePaymentRequest {
  cuentaOrigenId: string;
  proveedorId: string;
  numeroReferencia: string;
  monto: number;
  descripcion?: string;
}

export interface ServicePaymentResponse {
  success: boolean;
  message: string;
  payment?: ServicePayment;
  transaccionId?: string;
}
