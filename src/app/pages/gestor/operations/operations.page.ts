import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  AlertController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { TransactionService } from '../../../services/transaction.service';
import { OperationDetailModalComponent } from './operation-detail-modal/operation-detail-modal.component';

interface Operation {
  id: string;
  clienteId: string;
  clienteNombre: string;
  tipo: string;
  descripcion: string;
  monto: number;
  moneda: string;
  comision: number;
  estado: string;
  fecha: Date;
  cuentaOrigenNumero: string;
  cuentaDestinoNumero?: string;
  requiereAprobacion: boolean;
  esUrgente: boolean;
}

interface OperationGroup {
  date: Date;
  operations: Operation[];
}

interface OperationFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  clientName?: string;
  operationType?: string;
}

@Component({
  selector: 'app-operations',
  templateUrl: './operations.page.html',
  styleUrls: ['./operations.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class OperationsPage implements OnInit {
  operations: Operation[] = [];
  filteredOperations: Operation[] = [];
  groupedOperations: OperationGroup[] = [];
  urgentOperations: Operation[] = [];
  selectedStatus: string = 'all';
  isLoading = false;
  pendingCount = 0;

  summary = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  activeFilters: OperationFilters = {};
  hasActiveFilters = false;

  constructor(
    private transactionService: TransactionService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadOperations();
  }

  async loadOperations() {
    this.isLoading = true;
    try {
      // En producción, llamar al servicio
      // this.operations = await this.transactionService.getMyClientsOperations().toPromise() || [];

      // Datos simulados
      this.operations = [
        {
          id: '1',
          clienteId: '1',
          clienteNombre: 'Carlos Sánchez Mora',
          tipo: 'Transferencia',
          descripcion: 'Transferencia internacional',
          monto: 250000,
          moneda: 'CRC',
          comision: 5000,
          estado: 'PendienteAprobacion',
          fecha: new Date('2025-11-08T10:30:00'),
          cuentaOrigenNumero: '100000000001',
          cuentaDestinoNumero: '200000000123',
          requiereAprobacion: true,
          esUrgente: true,
        },
        {
          id: '2',
          clienteId: '2',
          clienteNombre: 'Ana Rodríguez Pérez',
          tipo: 'Transferencia',
          descripcion: 'Transferencia a tercero',
          monto: 180000,
          moneda: 'CRC',
          comision: 3000,
          estado: 'PendienteAprobacion',
          fecha: new Date('2025-11-08T09:15:00'),
          cuentaOrigenNumero: '100000000002',
          cuentaDestinoNumero: '300000000456',
          requiereAprobacion: true,
          esUrgente: true,
        },
        {
          id: '3',
          clienteId: '3',
          clienteNombre: 'José Martínez López',
          tipo: 'Pago de Servicio',
          descripcion: 'Pago de electricidad ICE',
          monto: 45000,
          moneda: 'CRC',
          comision: 0,
          estado: 'Exitosa',
          fecha: new Date('2025-11-08T08:45:00'),
          cuentaOrigenNumero: '100000000003',
          requiereAprobacion: false,
          esUrgente: false,
        },
        {
          id: '4',
          clienteId: '4',
          clienteNombre: 'María Fernández Castro',
          tipo: 'Transferencia',
          descripcion: 'Transferencia entre cuentas propias',
          monto: 75000,
          moneda: 'CRC',
          comision: 0,
          estado: 'Exitosa',
          fecha: new Date('2025-11-07T16:20:00'),
          cuentaOrigenNumero: '100000000004',
          cuentaDestinoNumero: '200000000004',
          requiereAprobacion: false,
          esUrgente: false,
        },
        {
          id: '5',
          clienteId: '5',
          clienteNombre: 'Pedro Ramírez Solís',
          tipo: 'Transferencia',
          descripcion: 'Transferencia a beneficiario',
          monto: 320000,
          moneda: 'CRC',
          comision: 5000,
          estado: 'PendienteAprobacion',
          fecha: new Date('2025-11-07T14:30:00'),
          cuentaOrigenNumero: '100000000005',
          cuentaDestinoNumero: '400000000789',
          requiereAprobacion: true,
          esUrgente: false,
        },
        {
          id: '6',
          clienteId: '6',
          clienteNombre: 'Laura Herrera Vargas',
          tipo: 'Pago de Servicio',
          descripcion: 'Pago de agua AyA',
          monto: 28000,
          moneda: 'CRC',
          comision: 0,
          estado: 'Exitosa',
          fecha: new Date('2025-11-07T11:10:00'),
          cuentaOrigenNumero: '100000000006',
          requiereAprobacion: false,
          esUrgente: false,
        },
        {
          id: '7',
          clienteId: '1',
          clienteNombre: 'Carlos Sánchez Mora',
          tipo: 'Transferencia',
          descripcion: 'Transferencia rechazada - Fondos insuficientes',
          monto: 500000,
          moneda: 'CRC',
          comision: 0,
          estado: 'Rechazada',
          fecha: new Date('2025-11-06T15:45:00'),
          cuentaOrigenNumero: '100000000001',
          requiereAprobacion: true,
          esUrgente: false,
        },
        {
          id: '8',
          clienteNombre: 'Sofía Campos Rojas',
          clienteId: '8',
          tipo: 'Transferencia',
          descripcion: 'Transferencia a cuenta externa',
          monto: 150000,
          moneda: 'CRC',
          comision: 3000,
          estado: 'Exitosa',
          fecha: new Date('2025-11-06T10:20:00'),
          cuentaOrigenNumero: '100000000008',
          cuentaDestinoNumero: '500000000111',
          requiereAprobacion: false,
          esUrgente: false,
        },
        {
          id: '9',
          clienteId: '9',
          clienteNombre: 'Roberto Méndez Ortiz',
          tipo: 'Pago de Servicio',
          descripcion: 'Pago de teléfono Kolbi',
          monto: 15000,
          moneda: 'CRC',
          comision: 0,
          estado: 'Exitosa',
          fecha: new Date('2025-11-05T14:00:00'),
          cuentaOrigenNumero: '100000000009',
          requiereAprobacion: false,
          esUrgente: false,
        },
        {
          id: '10',
          clienteId: '10',
          clienteNombre: 'Gabriela Castro Monge',
          tipo: 'Transferencia',
          descripcion: 'Transferencia programada',
          monto: 200000,
          moneda: 'CRC',
          comision: 0,
          estado: 'Programada',
          fecha: new Date('2025-11-10T08:00:00'),
          cuentaOrigenNumero: '100000000010',
          cuentaDestinoNumero: '600000000222',
          requiereAprobacion: false,
          esUrgente: false,
        },
      ];

      this.filteredOperations = [...this.operations];
      this.calculateSummary();
      this.groupOperationsByDate();
      this.identifyUrgentOperations();
    } catch (error) {
      console.error('Error loading operations:', error);
      await this.showToast('Error al cargar operaciones', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  calculateSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.summary.pending = this.operations.filter(
      (op) => op.estado === 'PendienteAprobacion'
    ).length;
    this.pendingCount = this.summary.pending;

    this.summary.approved = this.operations.filter((op) => {
      const opDate = new Date(op.fecha);
      opDate.setHours(0, 0, 0, 0);
      return op.estado === 'Exitosa' && opDate.getTime() === today.getTime();
    }).length;

    this.summary.rejected = this.operations.filter((op) => {
      const opDate = new Date(op.fecha);
      opDate.setHours(0, 0, 0, 0);
      return op.estado === 'Rechazada' && opDate.getTime() === today.getTime();
    }).length;
  }

  identifyUrgentOperations() {
    // Operaciones urgentes: monto > 200000 y pendientes de aprobación
    this.urgentOperations = this.operations.filter(
      (op) => op.estado === 'PendienteAprobacion' && op.monto > 200000
    );
  }

  filterOperations() {
    if (this.hasActiveFilters) {
      // Si hay filtros activos, aplicarlos de nuevo
      this.applyFilters(this.activeFilters);
    } else {
      // Comportamiento normal
      if (this.selectedStatus === 'all') {
        this.filteredOperations = [...this.operations];
      } else {
        this.filteredOperations = this.operations.filter(
          (op) => op.estado === this.selectedStatus
        );
      }
      this.groupOperationsByDate();
    }
  }

  groupOperationsByDate() {
    const groups: { [key: string]: Operation[] } = {};

    this.filteredOperations.forEach((operation) => {
      const date = new Date(operation.fecha);
      const key = date.toDateString();

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(operation);
    });

    this.groupedOperations = Object.keys(groups)
      .map((key) => {
        return {
          date: new Date(key),
          operations: groups[key].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          ),
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getOperationIcon(tipo: string): string {
    switch (tipo) {
      case 'Transferencia':
        return 'swap-horizontal';
      case 'Pago de Servicio':
        return 'card';
      case 'Depósito':
        return 'arrow-down-circle';
      case 'Retiro':
        return 'arrow-up-circle';
      default:
        return 'cash';
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'Exitosa':
        return 'success';
      case 'PendienteAprobacion':
        return 'warning';
      case 'Rechazada':
      case 'Fallida':
        return 'danger';
      case 'Programada':
        return 'primary';
      case 'Cancelada':
        return 'medium';
      default:
        return 'medium';
    }
  }

  async openOperationDetail(operation: Operation) {
    await this.viewOperationDetail(operation);
  }

  async viewOperationDetail(operation: Operation) {
    const modal = await this.modalController.create({
      component: OperationDetailModalComponent,
      componentProps: {
        operation: operation,
        onApprove: () => this.approveOperation(operation),
        onReject: () => this.rejectOperation(operation),
      },
      cssClass: 'operation-detail-modal',
    });
    await modal.present();
  }

  async approveOperation(operation: Operation) {
    const alert = await this.alertController.create({
      header: 'Aprobar Operación',
      message: `¿Está seguro de aprobar esta operación por ${
        operation.moneda
      } ${operation.monto.toLocaleString()} de ${operation.clienteNombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aprobar',
          handler: async () => {
            try {
              // En producción, llamar al servicio
              // await this.transactionService.approveTransaction(operation.id).toPromise();

              operation.estado = 'Exitosa';
              await this.showToast(
                'Operación aprobada exitosamente',
                'success'
              );
              this.calculateSummary();
              this.filterOperations();
            } catch (error) {
              console.error('Error approving operation:', error);
              await this.showToast('Error al aprobar la operación', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async rejectOperation(operation: Operation) {
    const alert = await this.alertController.create({
      header: 'Rechazar Operación',
      message: 'Ingrese el motivo del rechazo:',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Motivo del rechazo (requerido)',
          attributes: {
            minlength: 10,
            maxlength: 500,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Rechazar',
          handler: async (data) => {
            if (!data.reason || data.reason.trim().length < 10) {
              await this.showToast(
                'El motivo debe tener al menos 10 caracteres',
                'warning'
              );
              return false;
            }

            try {
              // En producción, llamar al servicio
              // await this.transactionService.rejectTransaction(operation.id, data.reason).toPromise();

              operation.estado = 'Rechazada';
              await this.showToast('Operación rechazada', 'success');
              this.calculateSummary();
              this.filterOperations();
            } catch (error) {
              console.error('Error rejecting operation:', error);
              await this.showToast('Error al rechazar la operación', 'danger');
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async openFilterModal() {
    const alert = await this.alertController.create({
      header: 'Filtrar Operaciones',
      cssClass: 'filter-modal',
      inputs: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Fecha Inicio',
          value: this.activeFilters.startDate || '',
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Fecha Fin',
          value: this.activeFilters.endDate || '',
        },
        {
          name: 'minAmount',
          type: 'number',
          placeholder: 'Monto Mínimo (₡)',
          value: this.activeFilters.minAmount || '',
          min: 0,
        },
        {
          name: 'maxAmount',
          type: 'number',
          placeholder: 'Monto Máximo (₡)',
          value: this.activeFilters.maxAmount || '',
          min: 0,
        },
        {
          name: 'clientName',
          type: 'text',
          placeholder: 'Nombre del Cliente',
          value: this.activeFilters.clientName || '',
        },
        {
          name: 'operationType',
          type: 'text',
          placeholder: 'Tipo (Transferencia, Pago, etc.)',
          value: this.activeFilters.operationType || '',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Limpiar Filtros',
          cssClass: 'secondary',
          handler: () => {
            this.clearFilters();
            return false; // No cerrar el modal
          },
        },
        {
          text: 'Aplicar',
          handler: (data) => {
            this.applyFilters(data);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  applyFilters(filters: OperationFilters) {
    // Guardar filtros activos
    this.activeFilters = { ...filters };

    // Verificar si hay filtros activos
    this.hasActiveFilters = Object.values(filters).some(
      (value) => value !== null && value !== undefined && value !== ''
    );

    // Comenzar con todas las operaciones
    let filtered = [...this.operations];

    // Aplicar filtro de fecha inicio
    if (filters.startDate) {
      // Crear fecha sin problemas de zona horaria
      const [year, month, day] = filters.startDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      filtered = filtered.filter((op) => {
        const opDate = new Date(op.fecha);
        opDate.setHours(0, 0, 0, 0);
        return opDate >= startDate;
      });
    }

    // Aplicar filtro de fecha fin
    if (filters.endDate) {
      // Crear fecha sin problemas de zona horaria
      const [year, month, day] = filters.endDate.split('-').map(Number);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      
      filtered = filtered.filter((op) => {
        const opDate = new Date(op.fecha);
        return opDate <= endDate;
      });
    }

    // Aplicar filtro de monto mínimo
    if (filters.minAmount && filters.minAmount > 0) {
      filtered = filtered.filter((op) => op.monto >= filters.minAmount!);
    }

    // Aplicar filtro de monto máximo
    if (filters.maxAmount && filters.maxAmount > 0) {
      filtered = filtered.filter((op) => op.monto <= filters.maxAmount!);
    }

    // Aplicar filtro de nombre de cliente
    if (filters.clientName && filters.clientName.trim() !== '') {
      const searchTerm = filters.clientName.toLowerCase().trim();
      filtered = filtered.filter((op) =>
        op.clienteNombre.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtro de tipo de operación
    if (filters.operationType && filters.operationType.trim() !== '') {
      const searchType = filters.operationType.toLowerCase().trim();
      filtered = filtered.filter((op) =>
        op.tipo.toLowerCase().includes(searchType)
      );
    }

    // Aplicar filtro de estado del segmento
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((op) => op.estado === this.selectedStatus);
    }

    this.filteredOperations = filtered;
    this.groupOperationsByDate();

    // Mostrar mensaje con resultados
    const message = this.hasActiveFilters
      ? `Filtros aplicados: ${filtered.length} operación(es) encontrada(s)`
      : 'Mostrando todas las operaciones';

    this.showToast(message, 'primary');
  }

  clearFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.filteredOperations = [...this.operations];
    this.filterOperations(); // Aplicar solo el filtro del segmento
    this.showToast('Filtros eliminados', 'medium');
  }

  getEmptyMessage(): string {
    switch (this.selectedStatus) {
      case 'PendienteAprobacion':
        return 'No hay operaciones pendientes de aprobación';
      case 'Exitosa':
        return 'No hay operaciones aprobadas en este período';
      case 'Rechazada':
        return 'No hay operaciones rechazadas';
      default:
        return 'No se encontraron operaciones';
    }
  }

  async handleRefresh(event: any) {
    await this.loadOperations();
    event.target.complete();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await toast.present();
  }
}

 
