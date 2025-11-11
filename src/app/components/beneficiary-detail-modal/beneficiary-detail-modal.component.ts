import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Beneficiary } from '../../models/beneficiary.model';

@Component({
  selector: 'app-beneficiary-detail-modal',
  templateUrl: './beneficiary-detail-modal.component.html',
  styleUrls: ['./beneficiary-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class BeneficiaryDetailModalComponent {
  @Input() beneficiary!: Beneficiary;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  getStatusColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'inactivo':
      case 'bloqueado':
        return 'danger';
      default:
        return 'medium';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getBankIcon(banco: string): string {
    // Retornar icono según el banco
    switch (banco.toLowerCase()) {
      case 'banco nacional':
      case 'bncr':
        return 'business';
      case 'banco popular':
        return 'people';
      case 'bac san josé':
      case 'bac':
        return 'card';
      default:
        return 'business-outline';
    }
  }

  getCountryFlag(pais: string): string {
    // Retornar emoji de bandera según el país
    switch (pais.toLowerCase()) {
      case 'costa rica':
        return '🇨🇷';
      case 'estados unidos':
      case 'usa':
        return '🇺🇸';
      case 'panamá':
        return '🇵🇦';
      case 'méxico':
        return '🇲🇽';
      default:
        return '🌎';
    }
  }
}