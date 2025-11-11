import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

interface Operation {
  id: string;
  clienteId: string;
  clienteNombre: string;
  tipo: string;
  descripcion: string;
  monto: number;
  moneda: string;
  comision: number;
  estado: string;
  fecha: Date;
  cuentaOrigenNumero: string;
  cuentaDestinoNumero?: string;
  requiereAprobacion: boolean;
  esUrgente: boolean;
}

@Component({
  selector: 'app-operation-detail-modal',
  templateUrl: './operation-detail-modal.component.html',
  styleUrls: ['./operation-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OperationDetailModalComponent {
  @Input() operation!: Operation;
  @Input() onApprove?: () => void;
  @Input() onReject?: () => void;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  approveOperation() {
    if (this.onApprove) {
      this.onApprove();
    }
    this.closeModal();
  }

  rejectOperation() {
    if (this.onReject) {
      this.onReject();
    }
    this.closeModal();
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'PendienteAprobacion': return 'warning';
      case 'Exitosa': return 'success';
      case 'Rechazada': return 'danger';
      default: return 'medium';
    }
  }
}