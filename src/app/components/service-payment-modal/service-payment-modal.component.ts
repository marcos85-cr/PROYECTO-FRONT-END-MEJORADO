import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { ServiceProvider, CreateServicePaymentRequest } from '../../models/service-payment.model';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { ServicePaymentService } from '../../services/service-payment.service';

@Component({
  selector: 'app-service-payment-modal',
  templateUrl: './service-payment-modal.component.html',
  styleUrls: ['./service-payment-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ServicePaymentModalComponent implements OnInit {
  @Input() provider!: ServiceProvider;

  accounts: Account[] = [];
  selectedAccountId: string = '';
  numeroReferencia: string = '';
  monto: number = 0;
  descripcion: string = '';
  
  validatingReference: boolean = false;
  referenceValid: boolean = false;
  validatedAmount: number = 0;
  validatedName: string = '';

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private accountService: AccountService,
    private servicePaymentService: ServicePaymentService
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getMyAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(acc => acc.estado === 'Activa');
      },
      error: (error) => {
        console.error('Error al cargar cuentas:', error);
      }
    });
  }

  async validateReference() {
    if (!this.numeroReferencia || this.numeroReferencia.length < 8) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Ingrese un número de referencia válido (mínimo 8 dígitos)',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.validatingReference = true;
    this.referenceValid = false;

    this.servicePaymentService.validateReference(this.provider.id, this.numeroReferencia).subscribe({
      next: (result) => {
        this.validatingReference = false;
        if (result.valid) {
          this.referenceValid = true;
          this.validatedAmount = result.monto || 0;
          this.validatedName = result.nombre || '';
          this.monto = this.validatedAmount;
        } else {
          this.showAlert('Referencia Inválida', 'El número de referencia no es válido o no existe.');
        }
      },
      error: (error) => {
        this.validatingReference = false;
        console.error('Error al validar referencia:', error);
        this.showAlert('Error', 'No se pudo validar la referencia. Intente nuevamente.');
      }
    });
  }

  async confirmPayment() {
    if (!this.selectedAccountId) {
      this.showAlert('Error', 'Seleccione una cuenta de origen');
      return;
    }

    if (!this.numeroReferencia) {
      this.showAlert('Error', 'Ingrese el número de referencia');
      return;
    }

    if (!this.monto || this.monto <= 0) {
      this.showAlert('Error', 'Ingrese un monto válido');
      return;
    }

    const selectedAccount = this.accounts.find(acc => acc.id === this.selectedAccountId);
    if (!selectedAccount) {
      this.showAlert('Error', 'Cuenta no encontrada');
      return;
    }

    if (selectedAccount.saldoDisponible < this.monto) {
      this.showAlert('Fondos Insuficientes', 'No tiene saldo suficiente en la cuenta seleccionada');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Pago',
      message: `¿Está seguro de pagar ₡${this.monto.toLocaleString('es-CR')} a ${this.provider.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.processPayment();
          }
        }
      ]
    });

    await alert.present();
  }

  async processPayment() {
    const loading = await this.loadingCtrl.create({
      message: 'Procesando pago...',
    });
    await loading.present();

    const request: CreateServicePaymentRequest = {
      cuentaOrigenId: this.selectedAccountId,
      proveedorId: this.provider.id,
      numeroReferencia: this.numeroReferencia,
      monto: this.monto,
      descripcion: this.descripcion
    };

    this.servicePaymentService.makeServicePayment(request).subscribe({
      next: async (response) => {
        await loading.dismiss();
        if (response.success) {
          const alert = await this.alertCtrl.create({
            header: 'Pago Exitoso',
            message: `Su pago ha sido procesado exitosamente. ID de transacción: ${response.transaccionId}`,
            buttons: [{
              text: 'OK',
              handler: () => {
                this.modalCtrl.dismiss({ success: true, payment: response.payment });
              }
            }]
          });
          await alert.present();
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error al procesar pago:', error);
        this.showAlert('Error', 'No se pudo procesar el pago. Intente nuevamente.');
      }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getAccountDisplayName(account: Account): string {
    return `${account.numeroCuenta} - ${account.tipo} (₡${account.saldoDisponible.toLocaleString('es-CR')})`;
  }

  getServiceColor(tipo: string): string {
    const colorMap: { [key: string]: string } = {
      'Agua': 'primary',
      'Electricidad': 'warning',
      'Telefonía': 'secondary',
      'Municipalidades': 'tertiary',
      'Cobro Judicial': 'danger'
    };
    return colorMap[tipo] || 'medium';
  }
}
