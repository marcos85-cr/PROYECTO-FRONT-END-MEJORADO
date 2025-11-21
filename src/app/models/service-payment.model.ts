export enum ServiceType {
  AGUA = 'Agua',
  ELECTRICIDAD = 'Electricidad',
  TELEFONIA = 'Telefonía',
  MUNICIPALIDADES = 'Municipalidades',
  COBRO_JUDICIAL = 'Cobro Judicial',
}
// Estado del pago
export enum PaymentStatus {
  PENDIENTE = 'Pendiente',
  PROCESANDO = 'Procesando',
  COMPLETADO = 'Completado',
  RECHAZADO = 'Rechazado',
}

// Reglas de validación para los campos de pago
export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  exactLength?: number;
  allowLetters?: boolean;
  allowNumbers?: boolean;
  customMessage?: string;
}

// Definición del proveedor de servicios
export interface ServiceProvider {
  id: string;
  nombre: string;
  tipo: ServiceType;
  icon: string;
  codigoEmpresa: string;
  activo: boolean;
  validationRules?: ValidationRule;
  descripcion?: string;
  fechaCreacion?: Date;
  
}
// Definición del pago de servicio
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
 // Solicitud para crear un pago de servicio
export interface CreateServicePaymentRequest {
  cuentaOrigenId: string;
  proveedorId: string;
  numeroReferencia: string;
  monto: number;
  descripcion?: string;
}
// Estado del pago export enum PaymentStatus {
export interface ServicePaymentResponse {
  success: boolean;
  message: string;
  payment?: ServicePayment;
  transaccionId?: string;
}

// Solicitud para crear un proveedor de servicios
export interface CreateServiceProviderRequest {
  nombre: string;
  tipo: ServiceType;
  icon: string;
  codigoEmpresa: string;
  descripcion?: string;
  validationRules?: ValidationRule;
}

// Respuesta al crear un proveedor de servicios
export interface CreateServiceProviderResponse {
  success: boolean;
  message: string;
  provider?: ServiceProvider;
}