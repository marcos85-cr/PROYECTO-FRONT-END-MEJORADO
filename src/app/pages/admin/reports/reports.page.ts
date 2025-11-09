


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ReportsPage implements OnInit {
  startDate: string = new Date().toISOString();
  endDate: string = new Date().toISOString();
  
  reportData = {
    totalTransactions: 0,
    totalVolume: 0,
    topClients: [] as any[],
    dailyVolume: [] as any[]
  };

  auditLogs: any[] = [];

  constructor(private toastController: ToastController) {}

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
        { nombre: 'Juan Pérez', transacciones: 45, volumen: 5600000 },
        { nombre: 'María López', transacciones: 38, volumen: 4800000 },
        { nombre: 'Carlos Sánchez', transacciones: 32, volumen: 3900000 },
        { nombre: 'Ana Rodríguez', transacciones: 28, volumen: 3200000 },
        { nombre: 'Pedro Martínez', transacciones: 25, volumen: 2800000 },
        { nombre: 'Laura García', transacciones: 22, volumen: 2500000 },
        { nombre: 'José Hernández', transacciones: 20, volumen: 2200000 },
        { nombre: 'Sofia Ramírez', transacciones: 18, volumen: 1900000 },
        { nombre: 'Diego Torres', transacciones: 15, volumen: 1600000 },
        { nombre: 'Lucía Flores', transacciones: 12, volumen: 1400000 }
      ],
      dailyVolume: [
        { fecha: new Date('2025-11-01'), monto: 1500000 },
        { fecha: new Date('2025-11-02'), monto: 1800000 },
        { fecha: new Date('2025-11-03'), monto: 1200000 },
        { fecha: new Date('2025-11-04'), monto: 2100000 },
        { fecha: new Date('2025-11-05'), monto: 1900000 }
      ]
    };
  }

  loadAuditLogs() {
    // Simulación de logs de auditoría
    this.auditLogs = [
      {
        id: '1',
        accion: 'CREAR_USUARIO',
        usuario: 'admin@banco.com',
        descripcion: 'Creó usuario gestor@banco.com',
        fecha: new Date('2025-11-08T10:30:00')
      },
      {
        id: '2',
        accion: 'APERTURA_CUENTA',
        usuario: 'gestor@banco.com',
        descripcion: 'Abrió cuenta 100000000001 para cliente Carlos Sánchez',
        fecha: new Date('2025-11-08T09:15:00')
      },
      {
        id: '3',
        accion: 'TRANSFERENCIA',
        usuario: 'cliente@banco.com',
        descripcion: 'Realizó transferencia de ₡50,000',
        fecha: new Date('2025-11-08T08:45:00')
      },
      {
        id: '4',
        accion: 'PAGO_SERVICIO',
        usuario: 'cliente@banco.com',
        descripcion: 'Pagó servicio de electricidad',
        fecha: new Date('2025-11-07T16:20:00')
      },
      {
        id: '5',
        accion: 'CAMBIO_PARAMETROS',
        usuario: 'admin@banco.com',
        descripcion: 'Actualizó límite diario de transferencias',
        fecha: new Date('2025-11-07T14:00:00')
      }
    ];
  }

  getAuditIcon(accion: string): string {
    switch (accion) {
      case 'CREAR_USUARIO':
        return 'person-add';
      case 'APERTURA_CUENTA':
        return 'wallet';
      case 'TRANSFERENCIA':
        return 'swap-horizontal';
      case 'PAGO_SERVICIO':
        return 'card';
      case 'CAMBIO_PARAMETROS':
        return 'settings';
      default:
        return 'information-circle';
    }
  }

  getAuditColor(accion: string): string {
    switch (accion) {
      case 'CREAR_USUARIO':
        return 'success';
      case 'APERTURA_CUENTA':
        return 'primary';
      case 'TRANSFERENCIA':
        return 'tertiary';
      case 'PAGO_SERVICIO':
        return 'warning';
      case 'CAMBIO_PARAMETROS':
        return 'danger';
      default:
        return 'medium';
    }
  }

  async downloadPDF() {
    await this.showToast('Generando reporte PDF...', 'primary');
    // Implementar lógica de descarga PDF
    setTimeout(async () => {
      await this.showToast('Reporte PDF descargado', 'success');
    }, 2000);
  }

  async downloadExcel() {
    await this.showToast('Generando reporte Excel...', 'primary');
    // Implementar lógica de descarga Excel
    setTimeout(async () => {
      await this.showToast('Reporte Excel descargado', 'success');
    }, 2000);
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