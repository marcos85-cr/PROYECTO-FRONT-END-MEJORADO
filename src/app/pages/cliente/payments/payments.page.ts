
// src/app/pages/cliente/payments/payments.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';

interface PaymentProvider {
  id: string;
  nombre: string;
  codigoValidacion: string;
  regex: RegExp;
}

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class PaymentsPage implements OnInit {
  paymentForm!: FormGroup;
  myAccounts: Account[] = [];
  providers: PaymentProvider[] = [];
  selectedProvider: PaymentProvider | null = null;
  isLoading = false;
  minDate: string = new Date().toISOString();
  maxDate: string = '';

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastController: ToastController,
    private navCtrl: NavController
  ) {
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 90);
    this.maxDate = maxDateObj.toISOString();
  }

  ngOnInit() {
    this.initForm();
    this.loadMyAccounts();
    this.loadProviders();
  }

  initForm() {
    this.paymentForm = this.fb.group({
      proveedorId: ['', Validators.required],
      numeroContrato: ['', Validators.required],
      cuentaOrigenId: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(1)]],
      programado: [false],
      fechaProgramada: [null]
    });

    this.paymentForm.get('programado')?.valueChanges.subscribe(value => {
      if (value) {
        this.paymentForm.get('fechaProgramada')?.setValidators(Validators.required);
      } else {
        this.paymentForm.get('fechaProgramada')?.clearValidators();
      }
      this.paymentForm.get('fechaProgramada')?.updateValueAndValidity();
    });
  }

  async loadMyAccounts() {
    try {
      // En producción usar: this.accountService.getMyAccounts().toPromise()
      // Datos simulados
      this.myAccounts = [
        {
          id: '1',
          numeroCuenta: '100000000001',
          tipo: 'Ahorros',
          moneda: 'CRC',
          saldo: 150000,
          estado: 'Activa',
          clienteId: '1',
          fechaApertura: new Date(),
          limiteDiario: 500000,
          saldoDisponible: 150000
        },
        {
          id: '2',
          numeroCuenta: '200000000002',
          tipo: 'Corriente',
          moneda: 'USD',
          saldo: 5000,
          estado: 'Activa',
          clienteId: '1',
          fechaApertura: new Date(),
          limiteDiario: 10000,
          saldoDisponible: 5000
        }
      ] as Account[];
    } catch (error) {
      console.error('Error loading accounts:', error);
      await this.showToast('Error al cargar cuentas', 'danger');
    }
  }

  loadProviders() {
    this.providers = [
      {
        id: '1',
        nombre: 'Electricidad - ICE',
        codigoValidacion: '8-12 dígitos',
        regex: /^\d{8,12}$/
      },
      {
        id: '2',
        nombre: 'Agua - AyA',
        codigoValidacion: '10 dígitos',
        regex: /^\d{10}$/
      },
      {
        id: '3',
        nombre: 'Teléfono - Kolbi',
        codigoValidacion: '8 dígitos',
        regex: /^\d{8}$/
      },
      {
        id: '4',
        nombre: 'Internet - Tigo',
        codigoValidacion: '8-10 dígitos',
        regex: /^\d{8,10}$/
      },
      {
        id: '5',
        nombre: 'Cable - Cabletica',
        codigoValidacion: '12 dígitos',
        regex: /^\d{12}$/
      },
      {
        id: '6',
        nombre: 'Seguro - INS',
        codigoValidacion: '9 dígitos',
        regex: /^\d{9}$/
      }
    ];
  }

  onProviderChange() {
    const providerId = this.paymentForm.get('proveedorId')?.value;
    this.selectedProvider = this.providers.find(p => p.id === providerId) || null;
    this.paymentForm.patchValue({ numeroContrato: '' });
  }

  validateContractNumber(contractNumber: string): boolean {
    if (!this.selectedProvider) return false;
    return this.selectedProvider.regex.test(contractNumber);
  }

  async makePayment() {
    if (this.paymentForm.invalid) {
      await this.showToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    // Validar número de contrato
    const contractNumber = this.paymentForm.get('numeroContrato')?.value;
    if (!this.validateContractNumber(contractNumber)) {
      await this.showToast(
        `El número de contrato no es válido. ${this.selectedProvider?.codigoValidacion}`,
        'warning'
      );
      return;
    }

    this.isLoading = true;
    try {
      // En producción usar servicio real
      // await this.paymentService.makePayment(this.paymentForm.value).toPromise();
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isProgramado = this.paymentForm.get('programado')?.value;
      await this.showToast(
        isProgramado 
          ? 'Pago programado exitosamente' 
          : 'Pago realizado exitosamente',
        'success'
      );
      
      this.navCtrl.back();
    } catch (error: any) {
      console.error('Error making payment:', error);
      await this.showToast(error.error?.message || 'Error al procesar el pago', 'danger');
    } finally {
      this.isLoading = false;
    }
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