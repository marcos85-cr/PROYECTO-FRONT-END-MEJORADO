import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, ToastController} from '@ionic/angular';
import { User } from '../../../models/user.model';
import { UserDetailModalComponent } from '../../../components/user-detail-modal/user-detail-modal.component';
import { CreateUserModalComponent } from './create-user-modal/create-user-modal.component';
import { UserService } from '../../../services/user.service';

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
        identificacion: '1-1111-1111', // ✅ Siempre asignado
        telefono: '8888-8888', // ✅ Siempre asignado
        bloqueado: false,
        intentosFallidos: 0,
        cuentasActivas: 0
      },
      {
        id: '2',
        email: 'gestor@banco.com',
        role: 'Gestor',
        nombre: 'María López',
        identificacion: '2-2222-2222', // ✅ Siempre asignado
        telefono: '7777-7777', // ✅ Siempre asignado
        bloqueado: false,
        intentosFallidos: 0,
        cuentasActivas: 0
      },
      {
        id: '3',
        email: 'cliente@banco.com',
        role: 'Cliente',
        nombre: 'Carlos Sánchez',
        identificacion: '3-3333-3333', // ✅ Siempre asignado
        telefono: '6666-6666', // ✅ Siempre asignado
        bloqueado: false,
        intentosFallidos: 0,
        cuentasActivas: 2
      }
    ];
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
        user.email.toLowerCase().includes(term) ||
        (user.identificacion?.includes(term) ?? false) // ✅ Manejar undefined
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
      // Asegurar que el nuevo usuario tenga todos los campos requeridos
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
      await this.editUser(data.user);
    }
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
    await toast.present();
  }
}