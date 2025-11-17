

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { Account } from '../../models/account.model';
import { Beneficiary } from '../../models/beneficiary.model';
import { TransferPrecheck } from '../../models/transaction.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonicModule],
})
export class TransferPage implements OnInit {
  transferForm!: FormGroup;
  myAccounts: Account[] = [];
  beneficiaries: Beneficiary[] = [];
  destinationType: string = 'own';
  preCheckResult: TransferPrecheck | null = null;
  isLoading = false;
  isExecuting = false;
  selectedCurrency = 'CRC';
  minDate: string = new Date().toISOString();
  maxDate: string = '';

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private beneficiaryService: BeneficiaryService,
    private toastController: ToastController,
    private navCtrl: NavController
  ) {
    // Calcular fecha máxima (90 días desde hoy)
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 90);
    this.maxDate = maxDateObj.toISOString();
  }

  ngOnInit() {
    this.initForm();
    this.loadMyAccounts();
    this.loadBeneficiaries();
  }

  initForm() {
    this.transferForm = this.fb.group({
      cuentaOrigenId: ['', Validators.required],
      cuentaDestinoId: [''],
      beneficiarioId: [''],
      monto: ['', [Validators.required, Validators.min(1)]],
      descripcion: [''],
      programada: [false],
      fechaProgramada: [null],
    });

    // Validación condicional
    this.transferForm.get('programada')?.valueChanges.subscribe((value) => {
      if (value) {
        this.transferForm
          .get('fechaProgramada')
          ?.setValidators(Validators.required);
      } else {
        this.transferForm.get('fechaProgramada')?.clearValidators();
      }
      this.transferForm.get('fechaProgramada')?.updateValueAndValidity();
    });
  }
  // Cargar cuentas del usuario
  async loadMyAccounts() {
    try {
      this.myAccounts =
        (await this.accountService.getMyAccounts().toPromise()) || [];
    } catch (error) {
      console.error('Error loading accounts:', error);
      await this.showToast('Error al cargar cuentas', 'danger');
    }
  }
    // Cargar beneficiarios activos
  async loadBeneficiaries() {
    try {
      const allBeneficiaries =
        (await this.beneficiaryService.getMyBeneficiaries().toPromise()) || [];
      // Filtrar solo beneficiarios activos/confirmados
      this.beneficiaries = allBeneficiaries.filter(
        (b) => b.estado === 'Activo'
      );
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    }
  }

  changeDestinationType(event: any) {
    this.destinationType = event.detail.value;
    // Limpiar campos de destino
    this.transferForm.patchValue({
      cuentaDestinoId: '',
      beneficiarioId: '',
    });
    this.preCheckResult = null;
  }

  async preCheckTransfer() {
    if (this.transferForm.invalid) {
      await this.showToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    // Validar que tenga destino
    if (
      this.destinationType === 'own' &&
      !this.transferForm.get('cuentaDestinoId')?.value
    ) {
      await this.showToast('Seleccione una cuenta destino', 'warning');
      return;
    }
    if (
      this.destinationType === 'beneficiary' &&
      !this.transferForm.get('beneficiarioId')?.value
    ) {
      await this.showToast('Seleccione un beneficiario', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      const data = {
        ...this.transferForm.value,
        idempotencyKey: this.transactionService.generateIdempotencyKey(),
      };

      this.preCheckResult =
        (await this.transactionService.transferPrecheck(data).toPromise()) ||
        null;

      // Obtener moneda de la cuenta origen
      const originAccount = this.myAccounts.find(
        (a) => a.id === data.cuentaOrigenId
      );
      if (originAccount) {
        this.selectedCurrency = originAccount.moneda;
      }

      if (this.preCheckResult && !this.preCheckResult.puedeEjecutar) {
        await this.showToast(
          this.preCheckResult.mensaje ||
            'No se puede ejecutar la transferencia',
          'warning'
        );
      }
    } catch (error: any) {
      console.error('Error in precheck:', error);
      await this.showToast(
        error.error?.message || 'Error al verificar la transferencia',
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }
  // Ejecutar transferencia 
  async executeTransfer() {
    if (!this.preCheckResult || !this.preCheckResult.puedeEjecutar) {
      return;
    }

    this.isExecuting = true;
    try {
      const data = {
        ...this.transferForm.value,
        idempotencyKey: this.transactionService.generateIdempotencyKey(),
      };

      const result = await this.transactionService
        .executeTransfer(data)
        .toPromise();

      await this.showToast(
        result?.estado === 'Programada'
          ? 'Transferencia programada exitosamente'
          : 'Transferencia realizada exitosamente',
        'success'
      );

      this.navCtrl.back();
    } catch (error: any) {
      console.error('Error executing transfer:', error);
      await this.showToast(
        error.error?.message || 'Error al ejecutar la transferencia',
        'danger'
      );
    } finally {
      this.isExecuting = false;
    }
  }

  cancelTransfer() {
    this.preCheckResult = null;
    this.transferForm.reset({
      programada: false,
    });
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
    });
    toast.present();
  }
}
