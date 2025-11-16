
// src/app/pages/auth/login/login.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      try {
        const response = await this.authService.login(this.loginForm.value).toPromise();
        
        if (response) {
          await this.showToast('Inicio de sesión exitoso', 'success');
          
          // Redirigir según el rol
          const user = response.user;
          if (user.role === 'Administrador') {
            this.router.navigate(['/admin/dashboard']);
          } else if (user.role === 'Gestor') {
            this.router.navigate(['/gestor/dashboard']);
          } else {
            this.router.navigate(['/tabs/home']);
          }
        }
      } catch (error: any) {
        console.error('Error en login:', error);
        const message = error.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
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