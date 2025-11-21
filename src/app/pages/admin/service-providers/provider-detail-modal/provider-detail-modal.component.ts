import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ServiceProvider, ValidationRule, ServiceType } from '../../../../models/service-payment.model';

@Component({
  selector: 'app-provider-detail-modal',
  templateUrl: './provider-detail-modal.component.html',
  styleUrls: ['./provider-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ProviderDetailModalComponent {
  @Input() provider!: ServiceProvider;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  getTypeColor(): string {
    switch (this.provider.tipo) {
      case ServiceType.AGUA:
        return 'primary';
      case ServiceType.ELECTRICIDAD:
        return 'warning';
      case ServiceType.TELEFONIA:
        return 'success';
      case ServiceType.MUNICIPALIDADES:
        return 'tertiary';
      case ServiceType.COBRO_JUDICIAL:
        return 'danger';
      default:
        return 'medium';
    }
  }

  getValidationDetails(): string[] {
    const rules = this.provider.validationRules;
    if (!rules) return ['Sin reglas definidas'];

    const details: string[] = [];

    if (rules.exactLength) {
      details.push(`Longitud exacta: ${rules.exactLength} caracteres`);
    } else {
      if (rules.minLength)
        details.push(`Mínimo: ${rules.minLength} caracteres`);
      if (rules.maxLength)
        details.push(`Máximo: ${rules.maxLength} caracteres`);
    }

    if (rules.allowNumbers && !rules.allowLetters) {
      details.push('Solo números');
    } else if (rules.allowLetters && rules.allowNumbers) {
      details.push('Números y letras');
    }

    if (rules.customMessage) {
      details.push(`Mensaje: ${rules.customMessage}`);
    }

    return details.length > 0 ? details : ['Sin reglas definidas'];
  }
}
