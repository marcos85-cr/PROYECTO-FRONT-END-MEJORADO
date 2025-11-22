import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';

interface Client {
  id: string;
  nombre: string;
  email: string;
  identificacion: string;
  telefono: string;
  cuentasActivas: number;
  ultimaOperacion: Date;
  estado: 'Activo' | 'Inactivo';
  volumenTotal: number;
}

@Component({
  selector: 'app-create-account-modal',
  templateUrl: './create-account-modal.component.html',
  styleUrls: ['./create-account-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class CreateAccountModalComponent implements OnInit {
  @Input() client!: Client;

  createAccountForm!: FormGroup;
  isLoading = false;

  accountTypes = ['Ahorros', 'Corriente', 'Inversión', 'Fondos de Inversión'];
  currencies = ['CRC', 'USD'];

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.createAccountForm = this.fb.group({
      tipo: ['', Validators.required],
      moneda: ['CRC', Validators.required],
      saldoInicial: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', [Validators.maxLength(200)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createAccountForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.createAccountForm.get(fieldName);
    
    if (fieldName === 'tipo' && field?.errors?.['required']) {
      return 'Seleccione un tipo de cuenta';
    }
    if (fieldName === 'saldoInicial') {
      if (field?.errors?.['required']) return 'El saldo inicial es requerido';
      if (field?.errors?.['min']) return 'El saldo debe ser mayor a 0';
    }
    return '';
  }

  async onSubmit() {
    if (this.createAccountForm.invalid) {
      await this.showToast('Por favor, complete todos los campos correctamente', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Creando cuenta...'
    });
    await loading.present();

    try {
      const formData = this.createAccountForm.value;

      // Simular delay de creación
      await new Promise(resolve => setTimeout(resolve, 1500));

      // En producción, llamar al servicio
      // await this.accountService.createAccount({
      //   clienteId: this.client.id,
      //   tipo: formData.tipo,
      //   moneda: formData.moneda,
      //   saldoInicial: formData.saldoInicial,
      //   descripcion: formData.descripcion
      // }).toPromise();

      await loading.dismiss();
      await this.showToast('Cuenta creada exitosamente', 'success');

      // Generar número de cuenta simulado
      const accountNumber = this.generateAccountNumber();

      this.modalCtrl.dismiss({
        action: 'accountCreated',
        account: {
          numero: accountNumber,
          tipo: formData.tipo,
          moneda: formData.moneda,
          saldo: `${formData.moneda === 'USD' ? '$' : '₡'}${Number(formData.saldoInicial).toLocaleString()}`,
          saldoNumerico: formData.saldoInicial,
          cliente: this.client.nombre,
          fechaApertura: new Date()
        }
      });
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error creating account:', error);

      const errorMessage = error?.message || 'Error al crear la cuenta';
      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Genera un número de cuenta simulado
   */
  private generateAccountNumber(): string {
    const prefix = Math.floor(Math.random() * 9) + 1; // 1-9
    const numbers = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${prefix}${numbers}`;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }
}