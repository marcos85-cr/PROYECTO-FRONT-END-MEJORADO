import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-detail-modal',
  templateUrl: './transaction-detail-modal.component.html',
  styleUrls: ['./transaction-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TransactionDetailModalComponent {
  @Input() transaction!: Transaction;
  @Input() onDownload!: () => void;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  async downloadReceipt() {
    if (this.onDownload) {
      this.onDownload();
    }
    this.dismiss();
  }

  getStatusColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'exitosa':
        return 'success';
      case 'pendiente':
      case 'pendienteaprobacion':
        return 'warning';
      case 'fallida':
      case 'rechazada':
        return 'danger';
      default:
        return 'medium';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatAmount(amount: number, currency: string): string {
    return `${currency} ${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}