import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ModalController, AlertController, ToastController} from '@ionic/angular';
import { User } from '../../../models/user.model';
import { UserDetailModalComponent } from '../../../components/user-detail-modal/user-detail-modal.component';
import { CreateUserModalComponent } from './create-user-modal/create-user-modal.component';
import { EditUserModalComponent } from '../../../components/edit-user-modal/edit-user-modal.component'; // ← NUEVO IMPORT
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class UsersPage implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = 'all';
  isLoading = false;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      const users = await this.userService.getAllUsers().toPromise();
      this.users = users || [];
      this.filteredUsers = [...this.users];
    } catch (error) {
      console.error('Error loading users:', error);
      this.loadMockUsers();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carga usuarios de prueba (fallback)
   */
  loadMockUsers() {
    this.users = [
      {
        id: '1',
        email: 'admin@banco.com',
        role: 'Administrador',
        nombre: 'Juan Pérez',
        identificacion: '1-1111-1111',
        telefono: '8888-8888',
        bloqueado: false,
        intentosFallidos: 0,
        cuentasActivas: 0
      },
      {
        id: '2',
        email: 'gestor@banco.com',
        role: 'Gestor',
        nombre: 'María López',
        identificacion: '2-2222-2222',
        telefono: '7777-7777',
        bloqueado: false,
        intentosFallidos: 0,
        cuentasActivas: 0
      },
      {
        id: '3',
        email: 'cliente@banco.com',
        role: 'Cliente',
        nombre: 'Carlos Sánchez',
        identificacion: '3-3333-3333',
        telefono: '6666-6666',
        bloqueado: false,
        intentosFallidos: 0,
        cuentasActivas: 2
      }
    ];
    this.filteredUsers = [...this.users];
  }

  filterUsers() {
    let filtered = [...this.users];

    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.identificacion?.includes(term) ?? false)
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

  /**
   * Abre el modal para crear un nuevo usuario
   */
  async openCreateModal() {
    const modal = await this.modalController.create({
      component: CreateUserModalComponent,
      cssClass: 'create-user-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data?.action === 'userCreated') {
      const newUser: User = {
        ...data.user,
        identificacion: data.user.identificacion ?? 'N/A',
        telefono: data.user.telefono ?? 'N/A',
        cuentasActivas: data.user.cuentasActivas ?? 0
      };
      
      this.users.push(newUser);
      this.filterUsers();
      await this.showToast('Usuario registrado exitosamente', 'success');
    }
  }

  /**
   * Abre el modal de detalle de usuario
   */
  async openUserDetail(user: User) {
    const modal = await this.modalController.create({
      component: UserDetailModalComponent,
      componentProps: {
        user: user
      },
      cssClass: 'user-detail-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data?.action === 'blockToggled') {
      const index = this.users.findIndex(u => u.id === data.user.id);
      if (index !== -1) {
        this.users[index] = data.user;
        this.filterUsers();
      }
    } else if (data?.action === 'cuentaCerradaToggled') {
      const index = this.users.findIndex(u => u.id === data.user.id);
      if (index !== -1) {
        this.users[index].bloqueado = data.estado;
        this.filterUsers();
      }
    } else if (data?.action === 'edit') {
      // ← AQUÍ: Abrir modal de edición en lugar de solo mostrar un toast
      await this.openEditModal(data.user);
    }
  }

  /**
   * Abre el modal para editar un usuario
   */
  async openEditModal(user: User) {
    const modal = await this.modalController.create({
      component: EditUserModalComponent,
      componentProps: {
        user: user
      },
      cssClass: 'edit-user-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data?.action === 'userUpdated') {
      const index = this.users.findIndex(u => u.id === data.user.id);
      if (index !== -1) {
        this.users[index] = data.user;
        this.filterUsers();
        await this.showToast('Usuario actualizado exitosamente', 'success');
      }
    }
  }

  async toggleUserBlock(user: User) {
    user.bloqueado = !user.bloqueado;
    await this.showToast(
      `Usuario ${user.bloqueado ? 'bloqueado' : 'desbloqueado'} exitosamente`,
      'success'
    );
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
    await toast.present();
  }
}