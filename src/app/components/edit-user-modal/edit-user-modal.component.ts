import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class EditUserModalComponent implements OnInit {
  @Input() user!: User;
  
  editUserForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  emailCheckInProgress = false;
  originalEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private userService: UserService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.originalEmail = this.user.email;
    this.initForm();
  }

  initForm() {
    this.editUserForm = this.fb.group({
      nombre: [this.user.nombre, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      identificacion: [this.user.identificacion || '', Validators.required],
      telefono: [this.user.telefono || '', Validators.required],
      role: [this.user.role, Validators.required],
      password: ['', []], // Opcional en edición
      confirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador de contraseña (más flexible para edición)
   */
  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null; // Permitir vacío en edición
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasUpperCase && hasNumber && hasMinLength;
    return !valid ? { invalidPassword: true } : null;
  }

  /**
   * Validador de coincidencia de contraseñas
   */
  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    // Si ambos campos están vacíos, es válido (edición sin cambiar contraseña)
    if (!password && !confirmPassword) {
      return null;
    }
    
    // Si uno está lleno, ambos deben estar llenos y coincidir
    if (password || confirmPassword) {
      return password === confirmPassword ? null : { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Verifica si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editUserForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error de contraseña
   */
  getPasswordError(): string {
    const passwordControl = this.editUserForm.get('password');
    
    if (passwordControl?.errors?.['required']) {
      return 'La contraseña es requerida';
    }
    
    if (passwordControl?.errors?.['invalidPassword']) {
      const value = passwordControl.value || '';
      const errors = [];
      
      if (value.length < 8) errors.push('mínimo 8 caracteres');
      if (!/[A-Z]/.test(value)) errors.push('1 mayúscula');
      if (!/[0-9]/.test(value)) errors.push('1 número');
      
      return `La contraseña necesita: ${errors.join(', ')}`;
    }
    
    return 'Contraseña inválida';
  }

  /**
   * Verifica si el email ya está registrado (solo si cambió)
   */
  async checkEmailUniqueness() {
    const emailControl = this.editUserForm.get('email');
    
    if (!emailControl || !emailControl.valid || this.emailCheckInProgress) {
      return;
    }

    // No validar si el email no cambió
    if (emailControl.value === this.originalEmail) {
      return;
    }

    this.emailCheckInProgress = true;
    
    this.userService.checkEmailAvailability(emailControl.value).subscribe({
      next: (response) => {
        this.emailCheckInProgress = false;
        
        if (!response.available) {
          emailControl.setErrors({ emailTaken: true });
        } else {
          if (emailControl.errors?.['emailTaken']) {
            const errors = { ...emailControl.errors };
            delete errors['emailTaken'];
            emailControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      },
      error: (error) => {
        this.emailCheckInProgress = false;
        console.error('Error checking email:', error);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.editUserForm.invalid) {
      await this.showToast('Por favor, complete todos los campos correctamente', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Actualizando usuario...'
    });
    await loading.present();

    try {
      const formData = this.editUserForm.value;
      
      // Preparar los datos para actualizar
      const updateData: Partial<User> = {
        email: formData.email,
        nombre: formData.nombre,
        identificacion: formData.identificacion,
        telefono: formData.telefono,
        role: formData.role
      };

      // Solo incluir contraseña si se proporciona
      let updateRequest: any = updateData;
      if (formData.password && formData.confirmPassword) {
        updateRequest = {
          ...updateData,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };
      }

      const updatedUser = await this.userService.updateUser(this.user.id, updateRequest).toPromise();

      await loading.dismiss();
      await this.showToast('Usuario actualizado exitosamente', 'success');
      
      this.modalCtrl.dismiss({
        action: 'userUpdated',
        user: updatedUser
      });
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error updating user:', error);
      
      const errorMessage = error.error?.message || 'Error al actualizar el usuario';
      await this.showToast(errorMessage, 'danger');
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
      color
    });
    await toast.present();
  }
}