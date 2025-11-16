import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-detail-modal',
  templateUrl: './user-detail-modal.component.html',
  styleUrls: ['./user-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UserDetailModalComponent {
  @Input() user!: User;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  closeModal() {
    this.modalController.dismiss();
  }

  async toggleBlock() {
    const alert = await this.alertController.create({
      header: 'Confirmar acción',
      message: `¿Estás seguro que deseas ${this.user.bloqueado ? 'desbloquear' : 'bloquear'} a ${this.user.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            this.user.bloqueado = !this.user.bloqueado;
            await this.showToast(
              `Usuario ${this.user.bloqueado ? 'bloqueado' : 'desbloqueado'} exitosamente`,
              'success'
            );
            this.modalController.dismiss({ action: 'blockToggled', user: this.user });
          }
        }
      ]
    });
    await alert.present();
  }

  cuentaCerrada: boolean = false;

async toggleCerrarCuenta() {
  const alert = await this.alertController.create({
    header: 'Confirmar acción',
    message: `¿Deseas ${this.cuentaCerrada ? 'reabrir' : 'cerrar'} la cuenta de ${this.user.nombre}?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Confirmar',
        handler: async () => {
          this.cuentaCerrada = !this.cuentaCerrada;

          await this.showToast(
            `Cuenta ${this.cuentaCerrada ? 'cerrada' : 'reabierta'} exitosamente`,
            this.cuentaCerrada ? 'danger' : 'success'
          );

          this.modalController.dismiss({
            action: 'cuentaCerradaToggled',
            estado: this.cuentaCerrada,
            user: this.user
          });
        }
      }
    ]
  });

  await alert.present();
}





  editUser() {
    this.modalController.dismiss({ action: 'edit', user: this.user });
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
