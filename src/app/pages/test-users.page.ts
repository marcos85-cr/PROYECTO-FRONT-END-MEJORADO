import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-test-users',
  templateUrl: './test-users.page.html',
  styleUrls: ['./test-users.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TestUsersPage {

  constructor(private toastController: ToastController) {}

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      const toast = await this.toastController.create({
        message: `${text} copiado al portapapeles`,
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    } catch (err) {
      console.error('Error al copiar:', err);
      const toast = await this.toastController.create({
        message: 'No se pudo copiar al portapapeles',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
    }
  }
}