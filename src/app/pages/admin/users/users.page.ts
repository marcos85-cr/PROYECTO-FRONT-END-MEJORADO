
// src/app/pages/admin/users/users.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class UsersPage implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = 'all';

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    // Simulación de datos - reemplazar con servicio real
    this.users = [
      {
        id: '1',
        email: 'admin@banco.com',
        role: 'Administrador',
        nombre: 'Juan Pérez',
        identificacion: '1-1111-1111',
        telefono: '8888-8888',
        bloqueado: false,
        intentosFallidos: 0
      },
      {
        id: '2',
        email: 'gestor@banco.com',
        role: 'Gestor',
        nombre: 'María López',
        identificacion: '2-2222-2222',
        telefono: '7777-7777',
        bloqueado: false,
        intentosFallidos: 0
      },
      {
        id: '3',
        email: 'cliente@banco.com',
        role: 'Cliente',
        nombre: 'Carlos Sánchez',
        identificacion: '3-3333-3333',
        telefono: '6666-6666',
        bloqueado: false,
        intentosFallidos: 0
      }
    ] as User[];
    
    this.filteredUsers = [...this.users];
  }

  filterUsers() {
    let filtered = [...this.users];

    // Filtrar por rol
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = filtered;
  }

  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'Administrador':
        return 'danger';
      case 'Gestor':
        return 'warning';
      case 'Cliente':
        return 'primary';
      default:
        return 'medium';
    }
  }

  async openCreateModal() {
    // Navegar a página de registro con modo admin
    const alert = await this.alertController.create({
      header: 'Crear Usuario',
      message: 'Esta funcionalidad abrirá el formulario de registro',
      buttons: ['OK']
    });
    await alert.present();
  }

  async openUserDetail(user: User) {
    const alert = await this.alertController.create({
      header: user.nombre,
      message: `
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Rol:</strong> ${user.role}</p>
        <p><strong>Identificación:</strong> ${user.identificacion}</p>
        <p><strong>Teléfono:</strong> ${user.telefono}</p>
        <p><strong>Estado:</strong> ${user.bloqueado ? 'Bloqueado' : 'Activo'}</p>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: user.bloqueado ? 'Desbloquear' : 'Bloquear',
          handler: () => {
            this.toggleUserBlock(user);
          }
        },
        {
          text: 'Editar',
          handler: () => {
            this.editUser(user);
          }
        }
      ]
    });
    await alert.present();
  }

  async toggleUserBlock(user: User) {
    user.bloqueado = !user.bloqueado;
    await this.showToast(
      `Usuario ${user.bloqueado ? 'bloqueado' : 'desbloqueado'} exitosamente`,
      'success'
    );
  }

  async editUser(user: User) {
    await this.showToast('Función de edición en desarrollo', 'warning');
  }

  async handleRefresh(event: any) {
    await this.loadUsers();
    event.target.complete();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    toast.present();
  }
}