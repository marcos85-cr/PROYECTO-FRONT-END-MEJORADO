import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TransactionService } from '../../../services/transaction.service';
import { CreateAccountModalComponent } from '../../../components/create-account-modal/create-account-modal.component';

interface Client {
  id: string;
  nombre: string;
  email: string;
  identificacion: string;
  telefono: string;
  cuentasActivas: number;
  ultimaOperacion: Date;
  estado: 'Activo' | 'Inactivo';
  volumenTotal: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class DashboardPage implements OnInit {
  userName: string = '';
  stats = {
    myClients: 0,
    activeAccounts: 0,
    todayOperations: 0,
    pendingApprovals: 0
  };
  pendingOperations: any[] = [];

  // Lista simulada de clientes del gestor
  myClients: Client[] = [
    {
      id: '1',
      nombre: 'Carlos Sánchez Mora',
      email: 'carlos.sanchez@email.com',
      identificacion: '1-1234-5678',
      telefono: '8888-9999',
      cuentasActivas: 3,
      ultimaOperacion: new Date('2025-11-07'),
      estado: 'Activo',
      volumenTotal: 5600000
    },
    {
      id: '2',
      nombre: 'Ana Rodríguez Pérez',
      email: 'ana.rodriguez@email.com',
      identificacion: '2-2345-6789',
      telefono: '7777-8888',
      cuentasActivas: 2,
      ultimaOperacion: new Date('2025-11-06'),
      estado: 'Activo',
      volumenTotal: 3200000
    },
    {
      id: '3',
      nombre: 'José Martínez López',
      email: 'jose.martinez@email.com',
      identificacion: '3-3456-7890',
      telefono: '6666-7777',
      cuentasActivas: 4,
      ultimaOperacion: new Date('2025-11-05'),
      estado: 'Activo',
      volumenTotal: 8900000
    }
  ];

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadStats();
    this.loadPendingOperations();
  }

  loadUserInfo() {
    const user = this.authService.currentUserValue;
    this.userName = user?.nombre || 'Gestor';
  }

  async loadStats() {
    this.stats = {
      myClients: this.myClients.length,
      activeAccounts: this.myClients.reduce((sum, client) => sum + client.cuentasActivas, 0),
      todayOperations: 12,
      pendingApprovals: 3
    };
  }

  async loadPendingOperations() {
    this.pendingOperations = [
      {
        id: '1',
        clienteNombre: 'Carlos Sánchez',
        descripcion: 'Transferencia internacional',
        monto: 150000,
        moneda: 'CRC'
      },
      {
        id: '2',
        clienteNombre: 'Ana Rodríguez',
        descripcion: 'Transferencia a tercero',
        monto: 80000,
        moneda: 'CRC'
      }
    ];
  }

  async approveOperation(id: string) {
    try {
      await this.transactionService.approveTransaction(id).toPromise();
      await this.showToast('Operación aprobada exitosamente', 'success');
      this.loadPendingOperations();
      this.loadStats();
    } catch (error) {
      await this.showToast('Error al aprobar la operación', 'danger');
    }
  }

  /**
   * Abre el modal para seleccionar cliente y crear cuenta
   */
  async openAccount() {
    if (this.myClients.length === 0) {
      await this.showToast('No tienes clientes asignados', 'warning');
      return;
    }

    if (this.myClients.length === 1) {
      // Si solo hay un cliente, abrir directamente
      await this.openCreateAccountForClient(this.myClients[0]);
    } else {
      // Si hay múltiples clientes, mostrar selector
      const alert = await this.alertController.create({
        header: 'Seleccionar Cliente',
        message: 'Selecciona el cliente para crear una nueva cuenta',
        inputs: this.myClients.map(client => ({
          type: 'radio' as const,
          label: client.nombre,
          value: client.id
        })),
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Siguiente',
            handler: (clientId) => {
              if (clientId) {
                const client = this.myClients.find(c => c.id === clientId);
                if (client) {
                  this.openCreateAccountForClient(client);
                }
              }
            }
          }
        ]
      });
      await alert.present();
    }
  }

  /**
   * Abre el modal para crear cuenta para un cliente específico
   */
  async openCreateAccountForClient(client: Client) {
    const modal = await this.modalController.create({
      component: CreateAccountModalComponent,
      componentProps: {
        client: client
      },
      cssClass: 'create-account-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.action === 'accountCreated') {
      // Actualizar número de cuentas del cliente
      const index = this.myClients.findIndex(c => c.id === client.id);
      if (index !== -1) {
        this.myClients[index].cuentasActivas++;
      }
      
      this.loadStats();
      await this.showToast('Cuenta creada exitosamente', 'success');
      
      // Mostrar detalles de la cuenta creada
      this.showAccountCreatedDetails(data.account);
    }
  }


  private async showAccountCreatedDetails(account: any) {
    const messageLines = [
      `Cliente: ${account.cliente}`,
  
      `Tipo de Cuenta: ${account.tipo}`,
   
      `Moneda: ${account.moneda}`,
  
      `Número de Cuenta: ${account.numero}`,
     
      `Saldo Inicial: ${account.saldo}`
    ].join('\n');

    const alert = await this.alertController.create({
      header: 'Cuenta Creada Con Éxito',
      message: `${messageLines}`,
      cssClass: 'account-created-alert',
      buttons: [
        {
          text: 'Aceptar',
          role: 'confirm',
          cssClass: 'alert-btn-accept'
        }
      ]
    });
    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
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