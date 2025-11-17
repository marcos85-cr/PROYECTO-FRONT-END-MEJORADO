export enum BeneficiaryStatus {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo',
  PENDIENTE_CONFIRMACION = 'Pendiente'
}

export interface Beneficiary {
  id: string;
  clienteId: string;
  alias: string;
  banco: string;
  numeroCuenta: string;
  moneda: string;
  pais: string;
  estado: BeneficiaryStatus;
  fechaCreacion: Date;
  tieneOperacionesPendientes: boolean;
}

export interface CreateBeneficiaryRequest {
  alias: string;
  banco: string;
  numeroCuenta: string;
  moneda: string;
  pais: string;
}

export interface UpdateBeneficiaryRequest {
  alias: string;
}

export interface DeleteBeneficiaryResponse {
  success: boolean;
  message: string;
  beneficiaryId?: string;
}