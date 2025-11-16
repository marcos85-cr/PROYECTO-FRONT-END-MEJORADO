


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterModule]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  canSelectRole = false; // Cambiar a true si el usuario logueado es admin

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
    // Verificar si el usuario actual es admin para mostrar selector de rol
    this.canSelectRole = this.authService.isAdmin();
  }

  initForm() {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      identificacion: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required],
      role: ['Cliente']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasUpperCase && hasNumber && hasSymbol && hasMinLength;

    return !valid ? { invalidPassword: true } : null;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      try {
        await this.authService.register(this.registerForm.value).toPromise();
        await this.showToast('Cuenta creada exitosamente', 'success');
        this.router.navigate(['/login']);
      } catch (error: any) {
        console.error('Error en registro:', error);
        const message = error.error?.message || 'Error al crear la cuenta. Intente nuevamente.';
        await this.showToast(message, 'danger');
      } finally {
        this.isLoading = false;
      }
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