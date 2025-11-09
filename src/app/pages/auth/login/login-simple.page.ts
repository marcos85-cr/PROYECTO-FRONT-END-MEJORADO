import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login-simple',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="login-container">
        <h1>Banca en Línea</h1>
        <p>Ingrese a su cuenta</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <ion-item>
            <ion-input 
              type="email" 
              formControlName="email" 
              placeholder="Correo electrónico"
              fill="outline">
            </ion-input>
          </ion-item>
          
          <ion-item>
            <ion-input 
              type="password" 
              formControlName="password" 
              placeholder="Contraseña"
              fill="outline">
            </ion-input>
          </ion-item>
          
          <ion-button expand="block" type="submit" [disabled]="!loginForm.valid">
            Iniciar Sesión
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class LoginSimplePage implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login attempt:', this.loginForm.value);
      
      const toast = await this.toastController.create({
        message: 'Login funcional - redirigiendo a tabs...',
        duration: 2000,
        position: 'top'
      });
      toast.present();
      
      // Simular login exitoso
      setTimeout(() => {
        this.router.navigate(['/tabs']);
      }, 2000);
    }
  }
}