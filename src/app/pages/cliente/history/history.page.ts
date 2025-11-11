


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { TransactionService } from '../../../services/transaction.service';
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
      // En caso de error, usar un ID de cuenta simulado
      this.currentAccount = { id: 'default-account' } as Account;
    }
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
    const modal = await this.modalController.create({
      component: TransactionDetailModalComponent,
      componentProps: {
        transaction: transaction,
        onDownload: () => this.downloadReceipt(transaction)
      },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75
    });
    
    return await modal.present();
  }



  async downloadReceipt(transaction: Transaction) {
    console.log('downloadReceipt called for transaction:', transaction.id);
    try {
      await this.showToast('Descargando comprobante...', 'primary');
      
      // Simular descarga por ahora hasta que el backend esté listo
      // TODO: Reemplazar con llamada real al servicio cuando el backend esté disponible
      console.log('Simulando descarga de comprobante...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear un blob simulado para la descarga
      const pdfContent = this.generateMockPDF(transaction);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      
      const filename = `comprobante-${transaction.numeroReferencia || transaction.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      this.downloadBlob(blob, filename);
      await this.showToast('Comprobante descargado exitosamente', 'success');
      
      // Para producción, descomentar el siguiente código:
      /*
      const blob = await firstValueFrom(this.reportService.downloadReceipt(transaction.id));
      
      if (blob) {
        const filename = `comprobante-${transaction.numeroReferencia || transaction.id}-${new Date().toISOString().split('T')[0]}.pdf`;
        this.downloadBlob(blob, filename);
        await this.showToast('Comprobante descargado exitosamente', 'success');
      } else {
        throw new Error('No se pudo generar el comprobante');
      }
      */
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      let errorMessage = 'Error al descargar comprobante';
      
      if (error?.status === 404) {
        errorMessage = 'Comprobante no encontrado';
      } else if (error?.status === 403) {
        errorMessage = 'No tiene permisos para descargar este comprobante';
      } else if (error?.status === 0) {
        errorMessage = 'Error de conexión. Verifique su internet';
      }
      
      await this.showToast(errorMessage, 'danger');
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
    console.log(`downloadStatementFile called with format: ${format}`);
    try {
      await this.showToast(`Generando extracto en ${format.toUpperCase()}...`, 'primary');
      
      // Simular generación de extracto por ahora hasta que el backend esté listo
      // TODO: Reemplazar con llamada real al servicio cuando el backend esté disponible
      console.log('Simulando generación de extracto...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear archivo simulado
      let content: string;
      let mimeType: string;
      
      if (format === 'csv') {
        content = this.generateMockCSV();
        mimeType = 'text/csv';
      } else {
        content = this.generateMockStatementPDF();
        mimeType = 'application/pdf';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const dateRange = `${this.startDate.toISOString().split('T')[0]}_${this.endDate.toISOString().split('T')[0]}`;
      const filename = `extracto-${dateRange}.${format}`;
      
      this.downloadBlob(blob, filename);
      await this.showToast(`Extracto ${format.toUpperCase()} descargado exitosamente`, 'success');
      
      // Para producción, descomentar el siguiente código:
      /*
      if (!this.currentAccount) {
        await this.showToast('No se pudo obtener la cuenta actual', 'danger');
        return;
      }

      const blob = await firstValueFrom(this.reportService.downloadStatement(
        this.currentAccount.id,
        this.startDate,
        this.endDate,
        format
      ));

      if (blob) {
        const dateRange = `${this.startDate.toISOString().split('T')[0]}_${this.endDate.toISOString().split('T')[0]}`;
        const filename = `extracto-${dateRange}.${format}`;
        this.downloadBlob(blob, filename);
        await this.showToast(`Extracto ${format.toUpperCase()} descargado exitosamente`, 'success');
      } else {
        throw new Error('No se pudo generar el extracto');
      }
      */
    } catch (error: any) {
      console.error('Error downloading statement:', error);
      let errorMessage = `Error al generar extracto ${format.toUpperCase()}`;
      
      if (error?.status === 404) {
        errorMessage = 'No se encontraron datos para el período seleccionado';
      } else if (error?.status === 403) {
        errorMessage = 'No tiene permisos para generar extractos';
      } else if (error?.status === 0) {
        errorMessage = 'Error de conexión. Verifique su internet';
      }
      
      await this.showToast(errorMessage, 'danger');
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
    // Generar contenido PDF completo con toda la información del modal
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
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
/F2 6 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 1800
>>
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
(Monto: ${transaction.moneda} ${transaction.monto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) Tj
0 -15 Td
(Comision: ${transaction.moneda} ${transaction.comision.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) Tj
0 -15 Td
/F2 11 Tf
(TOTAL: ${transaction.moneda} ${transaction.montoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) Tj

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
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
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
<<
/Size 7
/Root 1 0 R
>>
startxref
2234
%%EOF`;
  }

  private generateMockCSV(): string {
    // Generar extracto CSV simulado
    let csv = 'Fecha,Tipo,Descripcion,Monto,Moneda,Estado,Referencia\n';
    
    this.filteredTransactions.forEach(transaction => {
      const fecha = new Date(transaction.fecha).toISOString().split('T')[0];
      const descripcion = transaction.descripcion || transaction.beneficiarioNombre || 'N/A';
      csv += `${fecha},"${transaction.tipo}","${descripcion}",${transaction.monto},${transaction.moneda},"${transaction.estado}","${transaction.numeroReferencia}"\n`;
    });
    
    return csv;
  }

  private generateTransactionLines(): string {
    // Generar líneas de transacciones para el PDF del extracto
    let lines = '';
    
    this.filteredTransactions.slice(0, 15).forEach((transaction, index) => {
      const fecha = new Date(transaction.fecha).toLocaleDateString('es-ES');
      const tipo = transaction.tipo.substring(0, 15).padEnd(15);
      const beneficiario = (transaction.beneficiarioNombre || 'N/A').substring(0, 20).padEnd(20);
      const monto = `${transaction.moneda} ${transaction.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`.padEnd(12);
      const estado = transaction.estado.substring(0, 10);
      
      lines += `0 -12 Td\n(${fecha} ${tipo} ${beneficiario} ${monto} ${estado}) Tj\n`;
    });
    
    if (this.filteredTransactions.length > 15) {
      lines += `0 -15 Td\n(... y ${this.filteredTransactions.length - 15} transacciones mas) Tj\n`;
    }
    
    return lines;
  }

  private generateMockStatementPDF(): string {
    // Generar extracto PDF completo con detalles de cada transacción
    const dateRange = `${this.startDate.toLocaleDateString('es-ES')} - ${this.endDate.toLocaleDateString('es-ES')}`;
    
    // Calcular totales
    const totalCreditos = this.filteredTransactions
      .filter(t => t.monto > 0)
      .reduce((sum, t) => sum + t.monto, 0);
    
    const totalDebitos = this.filteredTransactions
      .filter(t => t.monto < 0)
      .reduce((sum, t) => sum + Math.abs(t.monto), 0);
    
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
/F2 6 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 1200
>>
stream
BT
/F2 16 Tf
72 720 Td
(EXTRACTO BANCARIO DETALLADO) Tj
0 -30 Td
/F1 10 Tf
(Periodo: ${dateRange}) Tj
0 -15 Td
(Fecha de emision: ${new Date().toLocaleDateString('es-ES')}) Tj

0 -30 Td
/F2 12 Tf
(RESUMEN DEL PERIODO) Tj
0 -20 Td
/F1 10 Tf
(Total de transacciones: ${this.filteredTransactions.length}) Tj
0 -15 Td
(Total creditos: CRC ${totalCreditos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}) Tj
0 -15 Td
(Total debitos: CRC ${totalDebitos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}) Tj

0 -30 Td
/F2 12 Tf
(DETALLE DE TRANSACCIONES) Tj
0 -20 Td
/F1 8 Tf
(Fecha        Tipo                Beneficiario           Monto        Estado) Tj
0 -12 Td
(-------------------------------------------------------------------------------) Tj
${this.generateTransactionLines()}

0 -30 Td
/F1 8 Tf
(Este extracto contiene todas las transacciones del periodo seleccionado.) Tj
0 -12 Td
(Sistema Bancario - ${new Date().getFullYear()}) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj
xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000246 00000 n 
0000001496 00000 n 
0000001563 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
1634
%%EOF`;
  }
}