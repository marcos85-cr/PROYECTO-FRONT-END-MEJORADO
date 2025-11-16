import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { UserService } from '../../../../services/user.service';
import { RegisterRequest } from '../../../../models/user.model';

@Component({
  selector: 'app-create-user-modal',
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class CreateUserModalComponent implements OnInit {
  createUserForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  emailCheckInProgress = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private userService: UserService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.createUserForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      identificacion: ['', Validators.required],
      telefono: ['', Validators.required],
      role: ['Cliente', Validators.required],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador de contraseña
   * Requiere: mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo
   */
  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null;
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
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Verifica si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createUserForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error de contraseña
   */
  getPasswordError(): string {
    const passwordControl = this.createUserForm.get('password');
    
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
   * Verifica si el email ya está registrado
   */
  async checkEmailUniqueness() {
    const emailControl = this.createUserForm.get('email');
    
    if (!emailControl || !emailControl.valid || this.emailCheckInProgress) {
      return;
    }

    this.emailCheckInProgress = true;
    
    this.userService.checkEmailAvailability(emailControl.value).subscribe({
      next: (response) => {
        this.emailCheckInProgress = false;
        
        if (!response.available) {
          emailControl.setErrors({ emailTaken: true });
        } else {
          // Si no hay otros errores, limpiar errores
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
    if (this.createUserForm.invalid) {
      await this.showToast('Por favor, complete todos los campos correctamente', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Creando usuario...'
    });
    await loading.present();

    try {
      const formData = this.createUserForm.value;
      const registerRequest: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nombre: formData.nombre,
        identificacion: formData.identificacion,
        telefono: formData.telefono,
        role: formData.role
      };

      const newUser = await this.userService.createUser(registerRequest).toPromise();

      await loading.dismiss();
      await this.showToast('Usuario creado exitosamente', 'success');
      
      this.modalCtrl.dismiss({
        action: 'userCreated',
        user: newUser
      });
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error creating user:', error);
      
      const errorMessage = error.error?.message || 'Error al crear el usuario';
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