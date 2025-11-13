import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

interface Client {
  id: string;
  nombre: string;
  email: string;
  identificacion: string;
  telefono: string;
  cuentasActivas: number;
  ultimaOperacion: Date;
  estado: 'Activo' | 'Inactivo';
  volumenTotal: number;
}

interface Account {
  tipo: string;
  numero: string;
  saldo: string;
  moneda: string;
}

@Component({
  selector: 'app-client-accounts-modal',
  templateUrl: './client-accounts-modal.component.html',
  styleUrls: ['./client-accounts-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ClientAccountsModalComponent {
  @Input() client!: Client;

  // Datos simulados de cuentas
  accounts: Account[] = [
    {
      tipo: 'Cuenta Ahorros CRC',
      numero: '100000000001',
      saldo: '₡150,000.00',
      moneda: 'CRC'
    },
    {
      tipo: 'Cuenta Corriente USD',
      numero: '200000000002',
      saldo: '$5,000.00',
      moneda: 'USD'
    },
    {
      tipo: 'Cuenta Inversión CRC',
      numero: '300000000003',
      saldo: '₡1,200,000.00',
      moneda: 'CRC'
    }
  ];

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  openNewAccount() {
    this.modalController.dismiss({ action: 'openNewAccount' });
  }

  getAccountIcon(tipo: string): string {
    if (tipo.includes('Ahorros')) return 'wallet';
    if (tipo.includes('Corriente')) return 'card';
    if (tipo.includes('Inversión')) return 'trending-up';
    return 'cash';
  }

  getAccountColor(moneda: string): string {
    return moneda === 'USD' ? 'success' : 'primary';
  }
}
