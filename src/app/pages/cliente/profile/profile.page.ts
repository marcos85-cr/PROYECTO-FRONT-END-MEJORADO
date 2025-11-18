import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  client: any = null;
  isLoading = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  loadProfile() {
    this.isLoading = true;
    
    setTimeout(() => {
      // Datos del cliente
      this.client = {
        id: '1',
        identificacion: '1-1234-5678',
        nombre: 'Marcos Vargas',
        telefono: '8888-9999',
        correo: 'marcos.vargas@email.com',
        estado: 'Activo',
        cuentasActivas: 3,
        saldoTotal: 150000,
        ultimaOperacion: new Date('2025-11-08'),
        fechaRegistro: new Date('2024-01-15')
      };

      this.profileForm.patchValue({
        nombre: this.client.nombre,
        telefono: this.client.telefono,
        correo: this.client.correo
      });

      this.isLoading = false;
    }, 500);
  }

  toggleEdit() {
    if (this.isEditing) {
      this.profileForm.patchValue({
        nombre: this.client?.nombre,
        telefono: this.client?.telefono,
        correo: this.client?.correo
      });
    }
    this.isEditing = !this.isEditing;
  }

  saveProfile() {
    if (this.profileForm.invalid || !this.client) {
      this.showToast('Completa los campos correctamente', 'warning');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      this.client.nombre = this.profileForm.get('nombre')?.value;
      this.client.telefono = this.profileForm.get('telefono')?.value;
      this.client.correo = this.profileForm.get('correo')?.value;

      this.isEditing = false;
      this.isLoading = false;
      this.showToast('Perfil actualizado exitosamente', 'success');
    }, 1000);
  }

  goBack() {
    this.navCtrl.back();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}