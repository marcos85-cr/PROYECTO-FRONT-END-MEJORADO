

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class DashboardPage implements OnInit {
  userName: string = '';
  stats = {
    myClients: 0,
    activeAccounts: 0,
    todayOperations: 0,
    pendingApprovals: 0
  };
  pendingOperations: any[] = [];

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadStats();
    this.loadPendingOperations();
  }

  loadUserInfo() {
    const user = this.authService.currentUserValue;
    this.userName = user?.nombre || 'Gestor';
  }

  async loadStats() {
    // Simulación de datos
    this.stats = {
      myClients: 24,
      activeAccounts: 58,
      todayOperations: 12,
      pendingApprovals: 3
    };
  }

  async loadPendingOperations() {
    // Simulación de datos
    this.pendingOperations = [
      {
        id: '1',
        clienteNombre: 'Carlos Sánchez',
        descripcion: 'Transferencia internacional',
        monto: 150000,
        moneda: 'CRC'
      },
      {
        id: '2',
        clienteNombre: 'Ana Rodríguez',
        descripcion: 'Transferencia a tercero',
        monto: 80000,
        moneda: 'CRC'
      }
    ];
  }

  async approveOperation(id: string) {
    try {
      await this.transactionService.approveTransaction(id).toPromise();
      await this.showToast('Operación aprobada exitosamente', 'success');
      this.loadPendingOperations();
      this.loadStats();
    } catch (error) {
      await this.showToast('Error al aprobar la operación', 'danger');
    }
  }

  openAccount() {
    this.showToast('Funcionalidad de apertura de cuenta disponible próximamente', 'primary');
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