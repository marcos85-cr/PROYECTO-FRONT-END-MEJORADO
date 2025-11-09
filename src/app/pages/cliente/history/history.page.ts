


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction.model';

interface TransactionGroup {
  date: Date;
  transactions: Transaction[];
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HistoryPage implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  groupedTransactions: TransactionGroup[] = [];
  selectedType: string = 'all';
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor(
    private transactionService: TransactionService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.startDate.setDate(this.startDate.getDate() - 30);
  }

  ngOnInit() {
    this.loadTransactions();
  }

  async loadTransactions() {
    try {
      // En producción usar: this.transactionService.getMyTransactions().toPromise()
      // Datos simulados
      this.transactions = [
        {
          id: '1',
          tipo: 'Transferencia',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          cuentaDestinoNumero: '200000000123',
          beneficiarioNombre: 'Juan Pérez',
          monto: 50000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 50000,
          estado: 'Exitosa',
          descripcion: 'Pago de préstamo',
          fecha: new Date('2025-11-08T10:30:00'),
          numeroReferencia: 'REF-2025110810301234'
        },
        {
          id: '2',
          tipo: 'Pago de Servicio',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          beneficiarioNombre: 'ICE - Electricidad',
          monto: 35000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 35000,
          estado: 'Exitosa',
          fecha: new Date('2025-11-07T14:20:00'),
          numeroReferencia: 'REF-2025110714205678'
        },
        {
          id: '3',
          tipo: 'Transferencia',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          cuentaDestinoNumero: '300000000456',
          beneficiarioNombre: 'María López',
          monto: 75000,
          moneda: 'CRC',
          comision: 1500,
          montoTotal: 76500,
          estado: 'Exitosa',
          fecha: new Date('2025-11-05T09:15:00'),
          numeroReferencia: 'REF-2025110509159012'
        },
        {
          id: '4',
          tipo: 'Pago de Servicio',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          beneficiarioNombre: 'AyA - Agua',
          monto: 18000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 18000,
          estado: 'Exitosa',
          fecha: new Date('2025-11-03T16:45:00'),
          numeroReferencia: 'REF-2025110316453456'
        },
        {
          id: '5',
          tipo: 'Transferencia',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          cuentaDestinoNumero: '400000000789',
          beneficiarioNombre: 'Carlos Sánchez',
          monto: 120000,
          moneda: 'CRC',
          comision: 2500,
          montoTotal: 122500,
          estado: 'PendienteAprobacion',
          descripcion: 'Transferencia internacional',
          fecha: new Date('2025-11-02T11:00:00'),
          numeroReferencia: 'REF-2025110211007890'
        },
        {
          id: '6',
          tipo: 'Transferencia',
          cuentaOrigenId: '2',
          cuentaOrigenNumero: '200000000002',
          cuentaDestinoNumero: '100000000001',
          beneficiarioNombre: 'Cuenta propia',
          monto: 500,
          moneda: 'USD',
          comision: 0,
          montoTotal: 500,
          estado: 'Exitosa',
          descripcion: 'Transferencia entre cuentas',
          fecha: new Date('2025-10-30T13:20:00'),
          numeroReferencia: 'REF-2025103013201122'
        },
        {
          id: '7',
          tipo: 'Pago de Servicio',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          beneficiarioNombre: 'Kolbi - Teléfono',
          monto: 25000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 25000,
          estado: 'Exitosa',
          fecha: new Date('2025-10-28T10:00:00'),
          numeroReferencia: 'REF-2025102810003344'
        },
        {
          id: '8',
          tipo: 'Transferencia',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          cuentaDestinoNumero: '500000000111',
          beneficiarioNombre: 'Ana Rodríguez',
          monto: 90000,
          moneda: 'CRC',
          comision: 1800,
          montoTotal: 91800,
          estado: 'Rechazada',
          descripcion: 'Fondos insuficientes',
          fecha: new Date('2025-10-25T15:30:00'),
          numeroReferencia: 'REF-2025102515305566'
        },
        {
          id: '9',
          tipo: 'Transferencia',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          cuentaDestinoNumero: '200000000002',
          beneficiarioNombre: 'Cuenta propia',
          monto: 200000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 200000,
          estado: 'Programada',
          descripcion: 'Ahorro mensual',
          fecha: new Date('2025-11-15T08:00:00'),
          numeroReferencia: 'REF-2025111508007788'
        },
        {
          id: '10',
          tipo: 'Pago de Servicio',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          beneficiarioNombre: 'Cabletica - Internet',
          monto: 42000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 42000,
          estado: 'Exitosa',
          fecha: new Date('2025-10-20T12:00:00'),
          numeroReferencia: 'REF-2025102012009900'
        }
      ] as Transaction[];
      
      this.filterTransactions();
    } catch (error) {
      console.error('Error loading transactions:', error);
      await this.showToast('Error al cargar transacciones', 'danger');
    }
  }

  filterTransactions() {
    let filtered = [...this.transactions];

    if (this.selectedType !== 'all') {
      filtered = filtered.filter(t => t.tipo === this.selectedType);
    }

    this.filteredTransactions = filtered;
    this.groupTransactionsByMonth();
  }

  groupTransactionsByMonth() {
    const groups: { [key: string]: Transaction[] } = {};

    this.filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.fecha);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(transaction);
    });

    this.groupedTransactions = Object.keys(groups).map(key => {
      const [year, month] = key.split('-').map(Number);
      return {
        date: new Date(year, month, 1),
        transactions: groups[key].sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getTransactionIcon(tipo: string): string {
    switch (tipo) {
      case 'Transferencia':
        return 'swap-horizontal';
      case 'Pago de Servicio':
        return 'card';
      case 'Depósito':
        return 'arrow-down-circle';
      case 'Retiro':
        return 'arrow-up-circle';
      default:
        return 'cash';
    }
  }

  getTransactionColor(estado: string): string {
    switch (estado) {
      case 'Exitosa':
        return 'success';
      case 'Fallida':
      case 'Rechazada':
        return 'danger';
      case 'Programada':
      case 'PendienteAprobacion':
        return 'warning';
      case 'Cancelada':
        return 'medium';
      default:
        return 'primary';
    }
  }

  getStatusBadgeColor(estado: string): string {
    return this.getTransactionColor(estado);
  }

  async openFilterModal() {
    const alert = await this.alertController.create({
      header: 'Filtrar Transacciones',
      inputs: [
        {
          name: 'startDate',
          type: 'date',
          value: this.startDate.toISOString().split('T')[0],
          label: 'Fecha Inicio'
        },
        {
          name: 'endDate',
          type: 'date',
          value: this.endDate.toISOString().split('T')[0],
          label: 'Fecha Fin'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aplicar',
          handler: (data) => {
            this.startDate = new Date(data.startDate);
            this.endDate = new Date(data.endDate);
            this.loadTransactions();
          }
        }
      ]
    });
    await alert.present();
  }

  async openTransactionDetail(transaction: Transaction) {
    const alert = await this.alertController.create({
      header: 'Detalle de Transacción',
      message: `
        <div class="transaction-detail">
          <p><strong>Tipo:</strong> ${transaction.tipo}</p>
          <p><strong>Para:</strong> ${transaction.beneficiarioNombre || 'N/A'}</p>
          ${transaction.descripcion ? `<p><strong>Descripción:</strong> ${transaction.descripcion}</p>` : ''}
          <hr>
          <p><strong>Cuenta Origen:</strong> ${transaction.cuentaOrigenNumero}</p>
          ${transaction.cuentaDestinoNumero ? `<p><strong>Cuenta Destino:</strong> ${transaction.cuentaDestinoNumero}</p>` : ''}
          <hr>
          <p><strong>Monto:</strong> ${transaction.moneda} ${transaction.monto.toFixed(2)}</p>
          <p><strong>Comisión:</strong> ${transaction.moneda} ${transaction.comision.toFixed(2)}</p>
          <p><strong>Total:</strong> ${transaction.moneda} ${transaction.montoTotal.toFixed(2)}</p>
          <hr>
          <p><strong>Estado:</strong> ${transaction.estado}</p>
          <p><strong>Fecha:</strong> ${new Date(transaction.fecha).toLocaleString()}</p>
          <p><strong>Referencia:</strong> ${transaction.numeroReferencia}</p>
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Descargar Comprobante',
          handler: () => {
            this.downloadReceipt(transaction);
          }
        }
      ]
    });
    await alert.present();
  }

  async downloadReceipt(transaction: Transaction) {
    try {
      await this.showToast('Descargando comprobante...', 'primary');
      
      // En producción usar: this.transactionService.downloadReceipt(transaction.id).toPromise()
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await this.showToast('Comprobante descargado', 'success');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      await this.showToast('Error al descargar comprobante', 'danger');
    }
  }

  async downloadStatement() {
    const alert = await this.alertController.create({
      header: 'Descargar Extracto',
      message: 'Seleccione el formato de descarga',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'PDF',
          handler: () => {
            this.downloadStatementFile('pdf');
          }
        },
        {
          text: 'CSV',
          handler: () => {
            this.downloadStatementFile('csv');
          }
        }
      ]
    });
    await alert.present();
  }

  async downloadStatementFile(format: 'pdf' | 'csv') {
    await this.showToast(`Generando extracto en ${format.toUpperCase()}...`, 'primary');
    
    // En producción usar servicio real
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.showToast(`Extracto ${format.toUpperCase()} descargado`, 'success');
  }

  async handleRefresh(event: any) {
    await this.loadTransactions();
    event.target.complete();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    toast.present();
  }
}