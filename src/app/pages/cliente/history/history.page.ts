import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { TransactionService } from '../../../services/transaction.service';
import { StatementService, StatementData } from '../../../services/statement.service';
import { ReportService } from '../../../services/report.service';
import { AccountService } from '../../../services/account.service';
import { Transaction } from '../../../models/transaction.model';
import { Account } from '../../../models/account.model';
import { TransactionDetailModalComponent } from '../../../components/transaction-detail-modal/transaction-detail-modal.component';

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
  currentAccount: Account | null = null;

  constructor(
    private transactionService: TransactionService,
    private statementService: StatementService,
    private reportService: ReportService,
    private accountService: AccountService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.startDate.setDate(this.startDate.getDate() - 30);
  }

  ngOnInit() {
    this.loadInitialData();
  }

  async loadInitialData() {
    try {
      await this.loadCurrentAccount();
      await this.loadTransactions();
    } catch (error) {
      console.error('Error loading initial data:', error);
      await this.showToast('Error al cargar datos', 'danger');
    }
  }

  async loadCurrentAccount() {
    try {
      const accounts = await firstValueFrom(this.accountService.getMyAccounts());
      this.currentAccount = accounts && accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error loading account:', error);
      this.currentAccount = { id: 'default-account' } as Account;
    }
  }

  async loadTransactions() {
    try {
      // Datos simulados de transacciones
      this.transactions = [
        {
          id: '1',
          tipo: 'Transferencia',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          cuentaDestinoNumero: '200000000123',
          beneficiarioNombre: 'Juan Pérez',
          monto: -50000,
          moneda: 'CRC',
          comision: 500,
          montoTotal: 50500,
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
          monto: -35000,
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
          monto: -75000,
          moneda: 'CRC',
          comision: 1500,
          montoTotal: 76500,
          estado: 'Exitosa',
          fecha: new Date('2025-11-05T09:15:00'),
          numeroReferencia: 'REF-2025110509159012'
        },
        {
          id: '4',
          tipo: 'Depósito',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          beneficiarioNombre: 'Depósito en efectivo',
          monto: 200000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 200000,
          estado: 'Exitosa',
          fecha: new Date('2025-11-03T16:45:00'),
          numeroReferencia: 'REF-2025110316453456'
        },
        {
          id: '5',
          tipo: 'Pago de Servicio',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          beneficiarioNombre: 'AyA - Agua',
          monto: -18000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 18000,
          estado: 'Exitosa',
          fecha: new Date('2025-11-02T11:00:00'),
          numeroReferencia: 'REF-2025110211007890'
        },
        {
          id: '6',
          tipo: 'Transferencia',
          cuentaOrigenId: '1',
          cuentaOrigenNumero: '100000000001',
          beneficiarioNombre: 'Cuenta propia',
          monto: 150000,
          moneda: 'CRC',
          comision: 0,
          montoTotal: 150000,
          estado: 'Exitosa',
          fecha: new Date('2025-10-30T13:20:00'),
          numeroReferencia: 'REF-2025103013201122'
        },
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
    const modal = await this.modalController.create({
      component: TransactionDetailModalComponent,
      componentProps: {
        transaction: transaction,
        onDownload: () => this.downloadReceipt(transaction)
      },
      cssClass: 'custom-modal-size'
    });
    
    return await modal.present();
  }

  async downloadReceipt(transaction: Transaction) {
    console.log('downloadReceipt called for transaction:', transaction.id);
    try {
      await this.showToast('Descargando comprobante...', 'primary');
      
      // Simular descarga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const pdfContent = this.generateMockPDF(transaction);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      
      const filename = `comprobante-${transaction.numeroReferencia || transaction.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      this.downloadBlob(blob, filename);
      await this.showToast('Comprobante descargado exitosamente', 'success');
    } catch (error: any) {
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
    try {
      if (!this.currentAccount) {
        await this.showToast('No se pudo obtener la cuenta actual', 'danger');
        return;
      }

      if (this.filteredTransactions.length === 0) {
        await this.showToast('No hay transacciones en el período seleccionado', 'warning');
        return;
      }

      await this.showToast(`Generando extracto ${format.toUpperCase()}...`, 'primary');
      
      // Generar datos del extracto con información completa
      const statementData = this.statementService.generateStatementData(
        this.filteredTransactions,
        this.currentAccount,
        this.startDate,
        this.endDate
      );

      // Generar archivo según el formato
      let blob: Blob;
      if (format === 'pdf') {
        blob = this.statementService.generatePDF(statementData);
        const dateRange = `${this.startDate.toISOString().split('T')[0]}_${this.endDate.toISOString().split('T')[0]}`;
        this.statementService.downloadPDF(`extracto-${dateRange}`, blob);
      } else {
        blob = this.statementService.generateCSV(statementData);
        const dateRange = `${this.startDate.toISOString().split('T')[0]}_${this.endDate.toISOString().split('T')[0]}`;
        this.statementService.downloadCSV(`extracto-${dateRange}`, blob);
      }

      await this.showToast(`Extracto ${format.toUpperCase()} descargado correctamente`, 'success');
    } catch (error: any) {
      console.error('Error:', error);
      await this.showToast(`Error al generar extracto`, 'danger');
    }
  }

  async handleRefresh(event: any) {
    await this.loadInitialData();
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

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateMockPDF(transaction: Transaction): string {
    const fechaFormateada = new Date(transaction.fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const clienteNombre = transaction.beneficiarioNombre || 'Usuario Actual';
    const descripcion = transaction.descripcion || 'N/A';
    const cuentaDestino = transaction.cuentaDestinoNumero || 'N/A';
    
    return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >>
>>
endobj
4 0 obj
<< /Length 1800 >>
stream
BT
/F2 16 Tf
72 720 Td
(COMPROBANTE DE OPERACION) Tj
0 -30 Td
/F1 10 Tf
(${new Date().toLocaleDateString('es-ES')}) Tj

0 -40 Td
/F2 12 Tf
(INFORMACION DEL CLIENTE) Tj
0 -20 Td
/F1 10 Tf
(Cliente: ${clienteNombre}) Tj

0 -30 Td
/F2 12 Tf
(DETALLES DE LA OPERACION) Tj
0 -20 Td
/F1 10 Tf
(Tipo: ${transaction.tipo}) Tj
0 -15 Td
(Descripcion: ${descripcion}) Tj

0 -30 Td
/F2 12 Tf
(CUENTAS INVOLUCRADAS) Tj
0 -20 Td
/F1 10 Tf
(Cuenta Origen: ${transaction.cuentaOrigenNumero}) Tj
0 -15 Td
(Cuenta Destino: ${cuentaDestino}) Tj

0 -30 Td
/F2 12 Tf
(INFORMACION FINANCIERA) Tj
0 -20 Td
/F1 10 Tf
(Monto: ${transaction.moneda} ${Math.abs(transaction.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}) Tj
0 -15 Td
(Comision: ${transaction.moneda} ${transaction.comision.toLocaleString('es-ES', { minimumFractionDigits: 2 })}) Tj
0 -15 Td
/F2 11 Tf
(TOTAL: ${transaction.moneda} ${transaction.montoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}) Tj

0 -30 Td
/F2 12 Tf
(ESTADO Y FECHAS) Tj
0 -20 Td
/F1 10 Tf
(Estado: ${transaction.estado}) Tj
0 -15 Td
(Fecha: ${fechaFormateada}) Tj
0 -15 Td
(Referencia: ${transaction.numeroReferencia}) Tj

0 -50 Td
/F1 8 Tf
(Este es un comprobante valido de la transaccion realizada.) Tj
0 -12 Td
(Conserve este documento para sus registros.) Tj
0 -20 Td
(Sistema Bancario - ${new Date().getFullYear()}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000246 00000 n 
0000002096 00000 n 
0000002163 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
2234
%%EOF`;
  }
}