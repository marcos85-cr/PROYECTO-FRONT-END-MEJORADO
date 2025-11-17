
import { HighValueOperationService } from '../../../services/high-value-operation.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DashboardPage implements OnInit {
  userName: string = '';
  stats = {
    totalUsers: 0,
    totalAccounts: 0,
    todayTransactions: 0,
    pendingApprovals: 0
  };
  pendingTransactions: any[] = [];

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private operationService: HighValueOperationService,  // Agregar esta línea
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadUserInfo();
    this.loadStats();
    this.loadPendingTransactions();
  }

  loadUserInfo() {
    const user = this.authService.currentUserValue;
    this.userName = user?.nombre || 'Administrador';
  }

  async loadStats() {
    // Simulación de datos - reemplazar con llamadas reales al API
    this.stats = {
      totalUsers: 145,
      totalAccounts: 328,
      todayTransactions: 52,
      pendingApprovals: 8  // Esto ya existe
    };

    // Agregar esta línea para obtener operaciones de alto valor pendientes
    try {
      const operations = await this.operationService.getPendingOperations().toPromise();
      this.stats.pendingApprovals = operations?.length || 8;
    } catch (error) {
      console.error('Error loading operations:', error);
    }
  }

  async loadPendingTransactions() {
    try {
      const transactions = await this.transactionService.getAllTransactions({
        estado: 'PendienteAprobacion'
      }).toPromise();
      this.pendingTransactions = transactions || [];
    } catch (error) {
      console.error('Error loading pending transactions:', error);
    }
  }

  async approveTransaction(id: string) {
    const alert = await this.alertController.create({
      header: 'Aprobar Transacción',
      message: '¿Está seguro de aprobar esta transacción?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aprobar',
          handler: async () => {
            try {
              await this.transactionService.approveTransaction(id).toPromise();
              await this.showToast('Transacción aprobada exitosamente', 'success');
              this.loadPendingTransactions();
              this.loadStats();
            } catch (error) {
              await this.showToast('Error al aprobar la transacción', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async rejectTransaction(id: string) {
    const alert = await this.alertController.create({
      header: 'Rechazar Transacción',
      message: 'Ingrese el motivo del rechazo:',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Motivo del rechazo'
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
            if (!data.reason) {
              await this.showToast('Debe ingresar un motivo', 'warning');
              return false;
            }
            try {
              await this.transactionService.rejectTransaction(id, data.reason).toPromise();
              await this.showToast('Transacción rechazada', 'success');
              this.loadPendingTransactions();
              this.loadStats();
            } catch (error) {
              await this.showToast('Error al rechazar la transacción', 'danger');
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    toast.present();
  }
}