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

@Component({
  selector: 'app-client-detail-modal',
  templateUrl: './client-detail-modal.component.html',
  styleUrls: ['./client-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ClientDetailModalComponent {
  @Input() client!: Client;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  viewAccounts() {
    this.modalController.dismiss({ action: 'viewAccounts' });
  }

  viewTransactions() {
    this.modalController.dismiss({ action: 'viewTransactions' });
  }
}
