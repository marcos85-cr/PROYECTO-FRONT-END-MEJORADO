import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HighValueOperation, RiskLevel } from '../../../../models/high-value-operation.model';
import { HighValueOperationService } from '../../../../services/high-value-operation.service';

@Component({
  selector: 'app-operation-detail-modal',
  templateUrl: './operation-detail-modal.component.html',
  styleUrls: ['./operation-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class OperationDetailModalComponent {
  @Input() operation!: HighValueOperation;
  
  newNote: string = '';

  constructor(
    private modalCtrl: ModalController,
    private operationService: HighValueOperationService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Verificada':
        return 'primary';
      case 'Aprobada':
        return 'success';
      case 'Rechazada':
        return 'danger';
      case 'Bloqueada':
        return 'dark';
      case 'Completada':
        return 'success';
      default:
        return 'medium';
    }
  }

  getRiskColor(nivel: string): string {
    switch (nivel) {
      case 'Bajo':
        return 'success';
      case 'Medio':
        return 'primary';
      case 'Alto':
        return 'warning';
      case 'Crítico':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'Transferencia Masiva':
        return 'swap-horizontal';
      case 'Transferencia Internacional':
        return 'globe';
      case 'Retiro de Efectivo Grande':
        return 'cash';
      case 'Depósito Masivo':
        return 'download';
      case 'Operación Sospechosa':
        return 'alert-circle';
      case 'Cambio de Límite':
        return 'trending-up';
      case 'Cierre de Cuenta':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }

  getDetailKeys(): string[] {
    return Object.keys(this.operation.detalles).filter(key => 
      this.operation.detalles[key] !== null && this.operation.detalles[key] !== undefined
    );
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  async addNote() {
    if (!this.newNote.trim()) {
      await this.showToast('Ingrese una nota', 'warning');
      return;
    }

    try {
      const loading = await this.loadingCtrl.create({ message: 'Guardando nota...' });
      await loading.present();

      await this.operationService.addNotes(
        this.operation.id,
        this.newNote
      ).toPromise();

      this.operation.notas += '\n' + this.newNote;
      this.newNote = '';

      await loading.dismiss();
      await this.showToast('Nota agregada', 'success');
    } catch (error) {
      await this.showToast('Error al agregar nota', 'danger');
    }
  }

  async approveOperation() {
    const alert = await this.alertCtrl.create({
      header: 'Aprobar Operación',
      message: `¿Está seguro de aprobar esta operación por ${ this.operation.moneda} ${this.operation.monto.toLocaleString()}?`,
      inputs: [
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aprobar',
          handler: async (data) => {
            await this.executeApprove(data.notas);
          }
        }
      ]
    });
    await alert.present();
  }

  async executeApprove(notas: string) {
    try {
      const loading = await this.loadingCtrl.create({ message: 'Aprobando...' });
      await loading.present();

      await this.operationService.approveOperation({
        operacionId: this.operation.id,
        notas
      }).toPromise();

      await loading.dismiss();
      await this.showToast('Operación aprobada', 'success');
      this.modalCtrl.dismiss({ action: 'approved' });
    } catch (error) {
      await this.showToast('Error al aprobar', 'danger');
    }
  }

  async blockOperation() {
    const alert = await this.alertCtrl.create({
      header: 'Bloquear Operación',
      message: 'Ingrese el motivo del bloqueo',
      inputs: [
        {
          name: 'razon',
          type: 'textarea',
          placeholder: 'Razón del bloqueo (requerido)'
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Bloquear',
          handler: async (data) => {
            if (!data.razon.trim()) {
              await this.showToast('Ingrese una razón', 'warning');
              return false;
            }
            await this.executeBlock(data.razon, data.notas);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async executeBlock(razon: string, notas: string) {
    try {
      const loading = await this.loadingCtrl.create({ message: 'Bloqueando...' });
      await loading.present();

      await this.operationService.blockOperation({
        operacionId: this.operation.id,
        razon,
        notas
      }).toPromise();

      await loading.dismiss();
      await this.showToast('Operación bloqueada', 'success');
      this.modalCtrl.dismiss({ action: 'blocked' });
    } catch (error) {
      await this.showToast('Error al bloquear', 'danger');
    }
  }

  async rejectOperation() {
    const alert = await this.alertCtrl.create({
      header: 'Rechazar Operación',
      message: 'Ingrese el motivo del rechazo',
      inputs: [
        {
          name: 'razon',
          type: 'textarea',
          placeholder: 'Razón del rechazo (requerido)'
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rechazar',
          handler: async (data) => {
            if (!data.razon.trim()) {
              await this.showToast('Ingrese una razón', 'warning');
              return false;
            }
            await this.executeReject(data.razon, data.notas);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async executeReject(razon: string, notas: string) {
    try {
      const loading = await this.loadingCtrl.create({ message: 'Rechazando...' });
      await loading.present();

      await this.operationService.rejectOperation({
        operacionId: this.operation.id,
        razon,
        notas
      }).toPromise();

      await loading.dismiss();
      await this.showToast('Operación rechazada', 'success');
      this.modalCtrl.dismiss({ action: 'rejected' });
    } catch (error) {
      await this.showToast('Error al rechazar', 'danger');
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}