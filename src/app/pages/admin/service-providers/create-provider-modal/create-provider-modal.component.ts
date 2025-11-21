import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ServicePaymentService } from '../../../../services/service-payment.service';
import {
  ServiceProvider,
  ServiceType,
  ValidationRule,
} from '../../../../models/service-payment.model';

@Component({
  selector: 'app-create-provider-modal',
  templateUrl: './create-provider-modal.component.html',
  styleUrls: ['./create-provider-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonicModule],
})
export class CreateProviderModalComponent implements OnInit {
  @Input() provider?: ServiceProvider;
  @Input() isEdit: boolean = false;

  providerForm: FormGroup;
  validationType: 'range' | 'exact' = 'range';

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController,
    private servicePaymentService: ServicePaymentService
  ) {
    this.providerForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigoEmpresa: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', Validators.required],
      icon: ['water'],
      descripcion: [''],
      minLength: [8, [Validators.required, Validators.min(1)]],
      maxLength: [12, [Validators.required, Validators.min(1)]],
      exactLength: [8, [Validators.min(1)]],
      onlyNumbers: [true],
      customMessage: [''],
    });
  }

  ngOnInit() {
    if (this.isEdit && this.provider) {
      this.loadProviderData();
    }
  }

  loadProviderData() {
    if (!this.provider) return;

    this.providerForm.patchValue({
      nombre: this.provider.nombre,
      codigoEmpresa: this.provider.codigoEmpresa,
      tipo: this.provider.tipo,
      icon: this.provider.icon,
      descripcion: this.provider.descripcion,
    });

    if (this.provider.validationRules) {
      const rules = this.provider.validationRules;

      if (rules.exactLength) {
        this.validationType = 'exact';
        this.providerForm.patchValue({
          exactLength: rules.exactLength,
        });
      } else {
        this.validationType = 'range';
        this.providerForm.patchValue({
          minLength: rules.minLength || 8,
          maxLength: rules.maxLength || 12,
        });
      }

      this.providerForm.patchValue({
        onlyNumbers: rules.allowNumbers && !rules.allowLetters,
        customMessage: rules.customMessage || '',
      });
    }
  }

  onValidationTypeChange() {
    // Limpiar validaciones anteriores
    this.providerForm.patchValue({
      minLength: 8,
      maxLength: 12,
      exactLength: 8,
    });
  }

  getValidationPreview(): string {
    const preview: string[] = [];

    if (this.validationType === 'exact') {
      const exactLength = this.providerForm.get('exactLength')?.value;
      if (exactLength) {
        preview.push(`✓ Debe tener exactamente ${exactLength} caracteres`);
      }
    } else {
      const minLength = this.providerForm.get('minLength')?.value;
      const maxLength = this.providerForm.get('maxLength')?.value;

      if (minLength && maxLength) {
        preview.push(`✓ Longitud entre ${minLength} y ${maxLength} caracteres`);
      } else if (minLength) {
        preview.push(`✓ Mínimo ${minLength} caracteres`);
      } else if (maxLength) {
        preview.push(`✓ Máximo ${maxLength} caracteres`);
      }
    }

    const onlyNumbers = this.providerForm.get('onlyNumbers')?.value;
    if (onlyNumbers) {
      preview.push('✓ Solo números permitidos');
    } else {
      preview.push('✓ Números y letras permitidos');
    }

    const customMessage = this.providerForm.get('customMessage')?.value;
    if (customMessage) {
      preview.push(`\nMensaje: "${customMessage}"`);
    }

    return preview.join('\n') || 'Configure las reglas de validación';
  }

  isFormValid(): boolean {
    const basicValid =
      this.providerForm.get('nombre')?.valid &&
      this.providerForm.get('codigoEmpresa')?.valid &&
      this.providerForm.get('tipo')?.valid;

    if (!basicValid) return false;

    if (this.validationType === 'exact') {
      return this.providerForm.get('exactLength')?.valid || false;
    } else {
      const minLength = this.providerForm.get('minLength')?.value;
      const maxLength = this.providerForm.get('maxLength')?.value;
      return minLength > 0 && maxLength > 0 && minLength <= maxLength;
    }
  }

  async saveProvider() {
    if (!this.isFormValid()) {
      await this.showToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    const formValue = this.providerForm.value;

    // Construir reglas de validación
    const validationRules: ValidationRule = {
      allowNumbers: formValue.onlyNumbers,
      allowLetters: !formValue.onlyNumbers,
      customMessage: formValue.customMessage || undefined,
    };

    if (this.validationType === 'exact') {
      validationRules.exactLength = formValue.exactLength;
    } else {
      validationRules.minLength = formValue.minLength;
      validationRules.maxLength = formValue.maxLength;
    }

    try {
      if (this.isEdit && this.provider) {
        // Actualizar proveedor existente
        await this.servicePaymentService
          .updateServiceProvider(this.provider.id, {
            nombre: formValue.nombre,
            descripcion: formValue.descripcion,
            icon: formValue.icon,
            validationRules: validationRules,
          })
          .toPromise();

        this.modalController.dismiss({ updated: true });
      } else {
        // Crear nuevo proveedor
        await this.servicePaymentService
          .createServiceProvider({
            nombre: formValue.nombre,
            codigoEmpresa: formValue.codigoEmpresa,
            tipo: formValue.tipo as ServiceType,
            icon: formValue.icon,
            descripcion: formValue.descripcion,
            validationRules: validationRules,
          })
          .toPromise();

        this.modalController.dismiss({ created: true });
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      await this.showToast('Error al guardar el proveedor', 'danger');
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await toast.present();
  }
}
