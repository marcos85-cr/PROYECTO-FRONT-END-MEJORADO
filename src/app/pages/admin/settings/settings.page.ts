import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';

interface SystemConfig {
  // Parámetros Generales
  bankName: string;
  contactEmail: string;
  supportPhone: string;

  // Límites y Restricciones
  dailyTransferLimit: number;
  highValueThreshold: number;
  atmWithdrawalLimit: number;

  // Seguridad
  maxLoginAttempts: number;
  sessionTimeout: number;
  requireTwoFactor: boolean;
  enableBiometric: boolean;

  // Tasas e Intereses
  savingsInterestRate: number;
  transferFee: number;
  atmFee: number;

  // Notificaciones
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface SystemInfo {
  version: string;
  lastUpdate: Date;
  environment: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class SettingsPage implements OnInit {
  config: SystemConfig = {
    // Parámetros Generales
    bankName: 'Banco Nacional Digital',
    contactEmail: 'soporte@banconacional.cr',
    supportPhone: '800-BANCO-CR',

    // Límites y Restricciones
    dailyTransferLimit: 5000000,
    highValueThreshold: 1000000,
    atmWithdrawalLimit: 300000,

    // Seguridad
    maxLoginAttempts: 3,
    sessionTimeout: 30,
    requireTwoFactor: true,
    enableBiometric: true,

    // Tasas e Intereses
    savingsInterestRate: 3.5,
    transferFee: 250,
    atmFee: 500,

    // Notificaciones
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true
  };

  systemInfo: SystemInfo = {
    version: '2.1.0',
    lastUpdate: new Date('2025-11-01'),
    environment: 'Producción'
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadConfig();
  }

  async loadConfig() {
    // En producción, cargar desde el backend
    // Por ahora usamos valores por defecto
    console.log('Configuración cargada');
  }

  async editConfig(field: keyof SystemConfig) {
    const fieldNames: Record<string, string> = {
      bankName: 'Nombre del Banco',
      contactEmail: 'Email de Contacto',
      supportPhone: 'Teléfono de Soporte',
      dailyTransferLimit: 'Límite Diario de Transferencias',
      highValueThreshold: 'Monto para Operación de Alto Valor',
      atmWithdrawalLimit: 'Límite de Retiro en Cajero',
      maxLoginAttempts: 'Intentos Máximos de Login',
      sessionTimeout: 'Tiempo de Sesión (minutos)',
      savingsInterestRate: 'Tasa de Interés - Ahorros (%)',
      transferFee: 'Comisión por Transferencia',
      atmFee: 'Comisión por Retiro en Cajero'
    };

    const isNumeric = typeof this.config[field] === 'number';

    const alert = await this.alertController.create({
      header: 'Editar Configuración',
      message: `Modificar: ${fieldNames[field] || field}`,
      inputs: [
        {
          name: 'value',
          type: isNumeric ? 'number' : 'text',
          placeholder: `Ingrese nuevo valor`,
          value: this.config[field]
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.value) {
              await this.showToast('Debe ingresar un valor', 'warning');
              return false;
            }
            
            (this.config as any)[field] = isNumeric ? Number(data.value) : data.value;
            await this.saveConfig();
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async saveConfig() {
    // En producción, guardar en el backend
    await this.showToast('Configuración actualizada', 'success');
  }

  async saveAllConfig() {
    const loading = await this.loadingController.create({
      message: 'Guardando configuración...',
      duration: 1000
    });

    await loading.present();

    try {
      // En producción, enviar al backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.showToast('Toda la configuración ha sido guardada exitosamente', 'success');
    } catch (error) {
      await this.showToast('Error al guardar la configuración', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async clearCache() {
    const alert = await this.alertController.create({
      header: 'Limpiar Caché',
      message: '¿Está seguro de eliminar todos los datos temporales del sistema?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpiar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Limpiando caché...',
              duration: 1500
            });
            await loading.present();
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.showToast('Caché limpiado exitosamente', 'success');
            await loading.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  async exportLogs() {
    const loading = await this.loadingController.create({
      message: 'Exportando logs...',
      duration: 2000
    });

    await loading.present();

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.showToast('Logs exportados exitosamente', 'success');
    } catch (error) {
      await this.showToast('Error al exportar logs', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async runDatabaseMaintenance() {
    const alert = await this.alertController.create({
      header: 'Mantenimiento de Base de Datos',
      message: 'Esta operación puede tardar varios minutos. ¿Desea continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ejecutar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Ejecutando mantenimiento...',
              duration: 3000
            });
            await loading.present();
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.showToast('Mantenimiento completado exitosamente', 'success');
            await loading.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  async backupDatabase() {
    const alert = await this.alertController.create({
      header: 'Respaldo de Base de Datos',
      message: '¿Desea crear un respaldo completo de la base de datos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear Respaldo',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Creando respaldo...',
              duration: 2500
            });
            await loading.present();
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            await this.showToast('Respaldo creado exitosamente', 'success');
            await loading.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
