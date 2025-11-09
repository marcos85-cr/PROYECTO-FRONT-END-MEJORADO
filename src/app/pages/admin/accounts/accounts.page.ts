


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { Account, AccountType } from '../../../models/account.model';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AccountsPage implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  searchTerm: string = '';
  selectedType: string = 'all';

  constructor(
    private accountService: AccountService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  async loadAccounts() {
    // Simulación de datos
    this.accounts = [
      {
        id: '1',
        numeroCuenta: '100000000001',
        tipo: AccountType.AHORROS,
        moneda: 'CRC',
        saldo: 150000,
        estado: 'Activa',
        clienteId: '3',
        clienteNombre: 'Carlos Sánchez',
        fechaApertura: new Date(),
        limiteDiario: 500000,
        saldoDisponible: 150000
      },
      {
        id: '2',
        numeroCuenta: '200000000002',
        tipo: AccountType.CORRIENTE,
        moneda: 'USD',
        saldo: 5000,
        estado: 'Activa',
        clienteId: '3',
        clienteNombre: 'Carlos Sánchez',
        fechaApertura: new Date(),
        limiteDiario: 10000,
        saldoDisponible: 5000
      }
    ] as Account[];
    
    this.filteredAccounts = [...this.accounts];
  }

  filterAccounts() {
    let filtered = [...this.accounts];

    // Filtrar por tipo
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(account => account.tipo === this.selectedType);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(account =>
        account.numeroCuenta.includes(term) ||
        account.clienteNombre?.toLowerCase().includes(term)
      );
    }

    this.filteredAccounts = filtered;
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.filterAccounts();
  }

  getAccountIcon(tipo: string): string {
    switch (tipo) {
      case 'Ahorros':
        return 'piggy-bank-outline';
      case 'Corriente':
        return 'wallet-outline';
      case 'Inversión':
        return 'trending-up-outline';
      case 'Plazo fijo':
        return 'time-outline';
      default:
        return 'card-outline';
    }
  }

  getAccountColor(tipo: string): string {
    switch (tipo) {
      case 'Ahorros':
        return 'success';
      case 'Corriente':
        return 'primary';
      case 'Inversión':
        return 'tertiary';
      case 'Plazo fijo':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'Activa':
        return 'success';
      case 'Bloqueada':
        return 'warning';
      case 'Cerrada':
        return 'danger';
      default:
        return 'medium';
    }
  }

  async openCreateAccountModal() {
    const alert = await this.alertController.create({
      header: 'Crear Nueva Cuenta',
      inputs: [
        {
          name: 'clienteId',
          type: 'text',
          placeholder: 'ID del Cliente'
        },
        {
          name: 'tipo',
          type: 'text',
          placeholder: 'Tipo de Cuenta'
        },
        {
          name: 'moneda',
          type: 'text',
          placeholder: 'Moneda (CRC/USD)'
        },
        {
          name: 'saldoInicial',
          type: 'number',
          placeholder: 'Saldo Inicial'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: async (data) => {
            await this.createAccount(data);
          }
        }
      ]
    });
    await alert.present();
  }

  async createAccount(data: any) {
    try {
      await this.accountService.createAccount(data).toPromise();
      await this.showToast('Cuenta creada exitosamente', 'success');
      this.loadAccounts();
    } catch (error) {
      await this.showToast('Error al crear la cuenta', 'danger');
    }
  }

  async openAccountDetail(account: Account) {
    const alert = await this.alertController.create({
      header: `Cuenta ${account.numeroCuenta}`,
      message: `
        <p><strong>Cliente:</strong> ${account.clienteNombre}</p>
        <p><strong>Tipo:</strong> ${account.tipo}</p>
        <p><strong>Moneda:</strong> ${account.moneda}</p>
        <p><strong>Saldo:</strong> ${account.moneda} ${account.saldo.toFixed(2)}</p>
        <p><strong>Estado:</strong> ${account.estado}</p>
        <p><strong>Límite Diario:</strong> ${account.moneda} ${account.limiteDiario.toFixed(2)}</p>
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  async blockAccount(account: Account) {
    const alert = await this.alertController.create({
      header: 'Bloquear Cuenta',
      message: `¿Está seguro de bloquear la cuenta ${account.numeroCuenta}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Bloquear',
          handler: async () => {
            try {
              await this.accountService.blockAccount(account.id).toPromise();
              await this.showToast('Cuenta bloqueada exitosamente', 'success');
              this.loadAccounts();
            } catch (error) {
              await this.showToast('Error al bloquear la cuenta', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async closeAccount(account: Account) {
    const alert = await this.alertController.create({
      header: 'Cerrar Cuenta',
      message: `¿Está seguro de cerrar la cuenta ${account.numeroCuenta}? Esta acción solo es posible si el saldo es 0.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar',
          handler: async () => {
            try {
              await this.accountService.closeAccount(account.id).toPromise();
              await this.showToast('Cuenta cerrada exitosamente', 'success');
              this.loadAccounts();
            } catch (error: any) {
              const message = error.error?.message || 'Error al cerrar la cuenta';
              await this.showToast(message, 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async handleRefresh(event: any) {
    await this.loadAccounts();
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
}