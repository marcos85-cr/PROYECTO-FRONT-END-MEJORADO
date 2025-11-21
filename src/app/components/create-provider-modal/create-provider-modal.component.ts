import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ProviderService } from '../../services/provider.service';
import {
  ServiceProvider,
  ServiceType,
  CreateProviderRequest,
} from '../../models/service-provider.model';

  
  


@Component({
  selector: 'app-create-provider-modal',
  templateUrl: './create-provider-modal.component.html',
  styleUrls: ['./create-provider-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
})
export class CreateProviderModalComponent implements OnInit {
  providerForm!: FormGroup;
  isLoading = false;
  previewValidation = '';
  testContract = '';
  testResult: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private providerService: ProviderService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.providerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', Validators.required],
      icon: [''],
      tipoValidacion: ['rango', Validators.required],
      digitosMin: [8],
      digitosMax: [12],
      digitosExactos: [10],
      regexCustom: [''],
      activo: [true],
    });

    // Actualizar vista previa cuando cambien los valores
    this.providerForm.valueChanges.subscribe(() => {
      this.updatePreview();
    });

    this.updatePreview();
  }

  onValidationTypeChange() {
    this.testResult = null;
    this.testContract = '';
    this.updatePreview();
  }

  updatePreview() {
    const tipo = this.providerForm.get('tipoValidacion')?.value;

    switch (tipo) {
      case 'rango':
        const min = this.providerForm.get('digitosMin')?.value || 8;
        const max = this.providerForm.get('digitosMax')?.value || 12;
        this.previewValidation = `El número debe tener entre ${min} y ${max} dígitos`;
        break;

      case 'exacto':
        const exacto = this.providerForm.get('digitosExactos')?.value || 10;
        this.previewValidation = `El número debe tener exactamente ${exacto} dígitos`;
        break;

      case 'minimo':
        const minimo = this.providerForm.get('digitosMin')?.value || 8;
        this.previewValidation = `El número debe tener al menos ${minimo} dígitos`;
        break;

      case 'custom':
        const regex = this.providerForm.get('regexCustom')?.value || '';
        this.previewValidation = regex
          ? `Patrón personalizado: ${regex}`
          : 'Ingrese una expresión regular';
        break;

      default:
        this.previewValidation = '';
    }
  }

  testValidation() {
    if (!this.testContract.trim()) {
      this.testResult = null;
      return;
    }

    const regex = this.generateRegex();
    this.testResult = regex.test(this.testContract);
  }

  generateRegex(): RegExp {
    const tipo = this.providerForm.get('tipoValidacion')?.value;

    switch (tipo) {
      case 'rango':
        const min = this.providerForm.get('digitosMin')?.value || 8;
        const max = this.providerForm.get('digitosMax')?.value || 12;
        return new RegExp(`^\\d{${min},${max}}$`);

      case 'exacto':
        const exacto = this.providerForm.get('digitosExactos')?.value || 10;
        return new RegExp(`^\\d{${exacto}}$`);

      case 'minimo':
        const minimo = this.providerForm.get('digitosMin')?.value || 8;
        return new RegExp(`^\\d{${minimo},}$`);

      case 'custom':
        const customRegex =
          this.providerForm.get('regexCustom')?.value || '^\\d+$';
        try {
          return new RegExp(customRegex);
        } catch {
          return /^\d+$/; // Fallback a solo dígitos
        }

      default:
        return /^\d+$/;
    }
  }

  generateValidationString(): string {
    const tipo = this.providerForm.get('tipoValidacion')?.value;

    switch (tipo) {
      case 'rango':
        const min = this.providerForm.get('digitosMin')?.value || 8;
        const max = this.providerForm.get('digitosMax')?.value || 12;
        return `${min}-${max} dígitos`;

      case 'exacto':
        const exacto = this.providerForm.get('digitosExactos')?.value || 10;
        return `${exacto} dígitos`;

      case 'minimo':
        const minimo = this.providerForm.get('digitosMin')?.value || 8;
        return `Mínimo ${minimo} dígitos`;

      case 'custom':
        return 'Patrón personalizado';

      default:
        return 'Solo dígitos';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.providerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  async onSubmit() {
    if (this.providerForm.invalid) {
      await this.showToast(
        'Por favor, complete todos los campos requeridos',
        'warning'
      );
      Object.keys(this.providerForm.controls).forEach((key) => {
        this.providerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    try {
      const regex = this.generateRegex();
      const validationString = this.generateValidationString();

      const newProvider: CreateProviderRequest = {
        // ✅ Usar CreateProviderRequest
        nombre: this.providerForm.get('nombre')?.value,
        tipo: this.providerForm.get('tipo')?.value,
        icon: this.providerForm.get('icon')?.value || 'business-outline',
        codigoValidacion: validationString,
        regex: regex.source,
        activo: this.providerForm.get('activo')?.value,
      };

      // Llamar al servicio para crear el proveedor
      await this.providerService.createProvider(newProvider).toPromise();

      await this.showToast('Proveedor creado exitosamente', 'success');
      this.modalCtrl.dismiss({ created: true });
    } catch (error: any) {
      console.error('Error creating provider:', error);
      await this.showToast(
        error.error?.message || 'Error al crear el proveedor',
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await toast.present();
  }
}
