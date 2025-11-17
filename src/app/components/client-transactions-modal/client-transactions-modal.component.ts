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

interface Transaction {
  id: string;
  fecha: Date;
  tipo: string;
  descripcion: string;
  monto: number;
  moneda: string;
  estado: string;
  cuenta: string;
}

@Component({
  selector: 'app-client-transactions-modal',
  templateUrl: './client-transactions-modal.component.html',
  styleUrls: ['./client-transactions-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ClientTransactionsModalComponent {
  @Input() client!: Client;

  // Datos simulados de transacciones
  transactions: Transaction[] = [
    {
      id: 'TRX001',
      fecha: new Date('2025-11-08'),
      tipo: 'Transferencia Enviada',
      descripcion: 'Pago a proveedor XYZ',
      monto: -250000,
      moneda: 'CRC',
      estado: 'Completada',
      cuenta: '100000000001'
    },
    {
      id: 'TRX002',
      fecha: new Date('2025-11-07'),
      tipo: 'Depósito',
      descripcion: 'Depósito en efectivo',
      monto: 500000,
      moneda: 'CRC',
      estado: 'Completada',
      cuenta: '100000000001'
    },
    {
      id: 'TRX003',
      fecha: new Date('2025-11-05'),
      tipo: 'Transferencia Recibida',
      descripcion: 'Pago de cliente ABC',
      monto: 1500000,
      moneda: 'CRC',
      estado: 'Completada',
      cuenta: '100000000001'
    },
    {
      id: 'TRX004',
      fecha: new Date('2025-11-03'),
      tipo: 'Retiro Cajero',
      descripcion: 'Retiro ATM Plaza Mayor',
      monto: -50000,
      moneda: 'CRC',
      estado: 'Completada',
      cuenta: '100000000001'
    },
    {
      id: 'TRX005',
      fecha: new Date('2025-11-01'),
      tipo: 'Pago Servicios',
      descripcion: 'Pago electricidad',
      monto: -45000,
      moneda: 'CRC',
      estado: 'Completada',
      cuenta: '100000000001'
    },
    {
      id: 'TRX006',
      fecha: new Date('2025-10-30'),
      tipo: 'Transferencia Enviada',
      descripcion: 'Transferencia internacional',
      monto: -2000,
      moneda: 'USD',
      estado: 'Completada',
      cuenta: '200000000002'
    },
    {
      id: 'TRX007',
      fecha: new Date('2025-10-28'),
      tipo: 'Depósito',
      descripcion: 'Depósito cheque',
      monto: 3000,
      moneda: 'USD',
      estado: 'Completada',
      cuenta: '200000000002'
    }
  ];

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  getTransactionIcon(tipo: string): string {
    if (tipo.includes('Transferencia Enviada')) return 'arrow-up-circle';
    if (tipo.includes('Transferencia Recibida')) return 'arrow-down-circle';
    if (tipo.includes('Depósito')) return 'cash';
    if (tipo.includes('Retiro')) return 'card';
    if (tipo.includes('Pago')) return 'receipt';
    return 'swap-horizontal';
  }
  // Obtener color según monto
  getTransactionColor(monto: number): string {
    return monto >= 0 ? 'success' : 'danger';
  }

  getIconColor(tipo: string): string {
    if (tipo.includes('Recibida') || tipo.includes('Depósito')) return 'success';
    if (tipo.includes('Enviada') || tipo.includes('Retiro') || tipo.includes('Pago')) return 'danger';
    return 'primary';
  }

  formatAmount(monto: number, moneda: string): string {
    const symbol = moneda === 'USD' ? '$' : '₡';
    const amount = Math.abs(monto).toLocaleString();
    return `${symbol}${amount}`;
  }
}
