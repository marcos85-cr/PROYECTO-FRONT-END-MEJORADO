import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { Beneficiary, BeneficiaryStatus } from '../../models/beneficiary.model';

@Component({
  selector: 'app-beneficiary-edit-modal',
  templateUrl: './beneficiary-edit-modal.component.html',
  styleUrls: ['./beneficiary-edit-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class BeneficiaryEditModalComponent {
  @Input() beneficiary!: Beneficiary;
  
  editedAlias: string = '';
  isEditing = false;
  isSaving = false;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.editedAlias = this.beneficiary.alias;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async startEdit() {
    this.isEditing = true;
  }

  async cancelEdit() {
    this.editedAlias = this.beneficiary.alias;
    this.isEditing = false;
  }

  async saveChanges() {
    if (!this.editedAlias || this.editedAlias.length < 3) {
      await this.showToast('El alias debe tener al menos 3 caracteres', 'warning');
      return;
    }

    this.isSaving = true;
    try {
      this.beneficiary.alias = this.editedAlias;
      await this.showToast('Beneficiario actualizado exitosamente', 'success');
      this.isEditing = false;
    } catch (error) {
      await this.showToast('Error al actualizar beneficiario', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  async deleteBeneficiary() {
    if (this.beneficiary.tieneOperacionesPendientes) {
      await this.showToast(
        'No se puede eliminar. Tiene operaciones programadas pendientes.',
        'warning'
      );
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar Beneficiario',
      message: `¿Está seguro de eliminar a <strong>${this.beneficiary.alias}</strong>?<br><br>Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.confirmDelete();
          }
        }
      ]
    });
    await alert.present();
  }

  private async confirmDelete() {
    try {

      await this.showToast('Beneficiario eliminado exitosamente', 'success');
      this.modalController.dismiss({ action: 'deleted', beneficiaryId: this.beneficiary.id });
    } catch (error) {
      await this.showToast('Error al eliminar beneficiario', 'danger');
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }
}
export class MiComponente {
  beneficiary: any; 

  getStatusColor(estado: string | undefined): string {
    if (!estado) return 'light'; 
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'inactivo':
        return 'medium';
      case 'suspendido':
        return 'danger';
      default:
        return 'light';
    }
  }
}