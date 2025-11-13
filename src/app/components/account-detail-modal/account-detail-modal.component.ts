import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-account-detail-modal',
  templateUrl: './account-detail-modal.component.html',
  styleUrls: ['./account-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AccountDetailModalComponent {
  @Input() account!: Account;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  getAccountIcon(tipo: string): string {
    switch (tipo) {
      case 'Ahorros':
        return 'wallet';
      case 'Corriente':
        return 'card';
      case 'Inversión':
        return 'trending-up';
      case 'Plazo fijo':
        return 'time';
      default:
        return 'cash';
    }
  }

  getAccountColor(tipo: string): string {
    switch (tipo) {
      case 'Ahorros':
        return 'success';
      case 'Corriente':
        return 'primary';
      case 'Inversión':
        return 'tertiary';
      case 'Plazo fijo':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'Activa':
        return 'success';
      case 'Bloqueada':
        return 'warning';
      case 'Cerrada':
        return 'danger';
      default:
        return 'medium';
    }
  }
}
