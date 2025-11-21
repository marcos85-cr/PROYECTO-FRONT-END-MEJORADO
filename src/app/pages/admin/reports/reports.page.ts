import { LoadingController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ReportsPage implements OnInit {
  // CORRECCIÓN 1: Inicializamos las fechas para solo incluir el formato 'YYYY-MM-DD'
  // Esto previene conflictos con el componente ion-datetime.
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  
  reportData = {
    totalTransactions: 0,
    totalVolume: 0,
    topClients: [] as any[],
    dailyVolume: [] as any[],
    // AÑADIDO: Guardar las fechas de forma legible para el PDF
    periodoInicio: '',
    periodoFin: ''
  };

  auditLogs: any[] = [];

  constructor(
    private toastController: ToastController,
    private reportService: ReportService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadReports();
    this.loadAuditLogs();
  }

  loadReports() {
    // Simulación de datos
    this.reportData = {
      totalTransactions: 1250,
      totalVolume: 45780000,
      topClients: [
        { nombre: 'Cliente A', volumen: 25000000, transacciones: 500 },
        { nombre: 'Cliente B', volumen: 12000000, transacciones: 300 },
        { nombre: 'Cliente C', volumen: 8780000, transacciones: 450 },
      ],
      dailyVolume: [
        { fecha: '2025-11-15', volumen: 15000000 },
        { fecha: '2025-11-16', volumen: 12000000 },
        { fecha: '2025-11-17', volumen: 18780000 },
      ],
      // ACTUALIZACIÓN DE FECHAS: Convertir las fechas ISO a un formato más legible
      // para que el PDF y la interfaz puedan leerlas.
      periodoInicio: new Date(this.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      periodoFin: new Date(this.endDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
    };
  }

  loadAuditLogs() {
    // Simulación de registros de auditoría
    this.auditLogs = [
      { id: 1, usuario: 'Admin', accion: 'LOGIN_EXITOSO', descripcion: 'Acceso desde IP 192.168.1.1', fecha: new Date() },
      { id: 2, usuario: 'User01', accion: 'TRANSACCION_FALLIDA', descripcion: 'Monto supera límite diario.', fecha: new Date(new Date().getTime() - 3600000) },
      { id: 3, usuario: 'Admin', accion: 'USUARIO_CREADO', descripcion: 'Nuevo usuario "User02" creado.', fecha: new Date(new Date().getTime() - 7200000) },
    ];
  }

  getAuditIcon(accion: string): string {
    if (accion.includes('EXITOSO')) return 'checkmark-circle';
    if (accion.includes('FALLIDA')) return 'close-circle';
    return 'information-circle';
  }

  getAuditColor(accion: string): string {
    if (accion.includes('EXITOSO')) return 'success';
    if (accion.includes('FALLIDA')) return 'danger';
    return 'primary';
  }

  async downloadPDF() {
    try {
      const loading = await this.loadingController.create({
        message: 'Generando PDF...'
      });
      await loading.present();

      // CORRECCIÓN 2: Llama a loadReports() para asegurar que las fechas del PDF (periodoInicio/Fin) estén actualizadas
      this.loadReports(); 
      
      const blob = this.reportService.generatePDFReport(this.reportData);
      const filename = `reporte_operaciones_${new Date().toISOString().split('T')[0]}.pdf`;
      
      this.reportService.downloadFile(blob, filename);
      
      await loading.dismiss();
      await this.showToast('Reporte PDF descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      await this.showToast('Error al generar el PDF', 'danger');
    }
}

async downloadExcel() {
    try {
      const loading = await this.loadingController.create({
        message: 'Generando Excel...'
      });
      await loading.present();

      // Llama a loadReports() para asegurar que los datos estén actualizados
      this.loadReports();

      const blob = this.reportService.generateExcelReport(this.reportData);
      const filename = `reporte_operaciones_${new Date().toISOString().split('T')[0]}.csv`;
      
      this.reportService.downloadFile(blob, filename);
      
      await loading.dismiss();
      await this.showToast('Reporte Excel descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      await this.showToast('Error al generar el Excel', 'danger');
    }
}

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color
    });
    toast.present();
  }
}