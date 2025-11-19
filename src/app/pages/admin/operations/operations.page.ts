import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController, LoadingController } from '@ionic/angular';
import { HighValueOperation, HighValueOperationStatus, RiskLevel } from '../../../models/high-value-operation.model';
import { HighValueOperationService } from '../../../services/high-value-operation.service';
import { OperationDetailModalComponent } from './operation-detail-modal/operation-detail-modal.component';



interface OperationGroup {
  date: Date;
  operations: HighValueOperation[];
}

@Component({
  selector: 'app-operations',
  templateUrl: './operations.page.html',
  styleUrls: ['./operations.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class OperationsPage implements OnInit {
  operations: HighValueOperation[] = [];
  filteredOperations: HighValueOperation[] = [];
  groupedOperations: OperationGroup[] = [];
  criticalOperations: HighValueOperation[] = [];
  selectedStatus: string = 'all';
  isLoading = false;

  // Contadores
  pendingCount = 0;
  blockedCount = 0;
  criticalCount = 0;
  highRiskCount = 0;
  totalVolume = 0;

  activeFilters: {
    minAmount?: number;
    maxAmount?: number;
    riskLevel?: string;
    operationType?: string;
  } = {};

  constructor(
    private operationService: HighValueOperationService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadOperations();
  }

  async loadOperations() {
    this.isLoading = true;
    try {
      const operations = await this.operationService
        .getAllOperations()
        .toPromise();
      this.operations = operations || [];
      this.applyAllFilters();
      this.calculateStatistics();
      this.groupOperationsByDate();
      this.identifyCriticalOperations();
    } catch (error) {
      console.error('Error loading operations:', error);
      this.loadMockOperations();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carga operaciones de prueba
   */
  loadMockOperations() {
    this.operations = [
      {
        id: '1',
        clienteId: '1',
        clienteNombre: 'Carlos Sánchez Mora',
        clienteEmail: 'carlos.sanchez@email.com',
        tipo: 'Transferencia Internacional',
        monto: 500000,
        moneda: 'CRC',
        estado: HighValueOperationStatus.PENDIENTE,
        nivelRiesgo: RiskLevel.CRITICO,
        descripcion: 'Transferencia a cuenta externa en el extranjero',
        detalles: {
          cuentaOrigen: '100000000001',
          banco: 'SWIFT CODE XYZ',
          pais: 'Estados Unidos',
        },
        flagsRiesgo: [
          'Monto inusual',
          'Transferencia internacional',
          'Primer destino',
        ],
        notas: '',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        requiereVerificacionAdicional: true,
        verificacionAdicional: {
          tipo: 'Llamada telefónica',
          estado: 'Pendiente',
        },
      },
      {
        id: '2',
        clienteId: '2',
        clienteNombre: 'Ana Rodríguez Pérez',
        clienteEmail: 'ana.rodriguez@email.com',
        tipo: 'Retiro de Efectivo Grande',
        monto: 250000,
        moneda: 'CRC',
        estado: HighValueOperationStatus.PENDIENTE,
        nivelRiesgo: RiskLevel.ALTO,
        descripcion: 'Retiro de efectivo en sucursal',
        detalles: {
          cuentaOrigen: '100000000002',
          sucursal: 'San José Central',
        },
        flagsRiesgo: ['Monto grande', 'Retiro en efectivo'],
        notas: '',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        requiereVerificacionAdicional: false,
      },
      {
        id: '3',
        clienteId: '3',
        clienteNombre: 'José Martínez López',
        clienteEmail: 'jose.martinez@email.com',
        tipo: 'Transferencia Masiva',
        monto: 1500000,
        moneda: 'CRC',
        estado: HighValueOperationStatus.BLOQUEADA,
        nivelRiesgo: RiskLevel.CRITICO,
        descripcion: 'Transferencia múltiple a varias cuentas',
        detalles: {
          cuentaOrigen: '100000000003',
          numeroTransferencias: 15,
        },
        flagsRiesgo: [
          'Volumen excepcional',
          'Múltiples destinos',
          'Patrón inusual',
        ],
        razonBloqueo: 'Patrón sospechoso detectado',
        notas: 'Bloqueado automáticamente por sistema de detección de fraude',
        creadoEn: new Date(Date.now() - 86400000),
        actualizadoEn: new Date(),
        requiereVerificacionAdicional: true,
        verificacionAdicional: {
          tipo: 'Investigación de fraude',
          estado: 'Pendiente',
        },
      },
      {
        id: '4',
        clienteId: '4',
        clienteNombre: 'María Fernández Castro',
        clienteEmail: 'maria.fernandez@email.com',
        tipo: 'Transferencia Masiva',
        monto: 800000,
        moneda: 'CRC',
        estado: HighValueOperationStatus.APROBADA,
        nivelRiesgo: RiskLevel.MEDIO,
        descripcion: 'Transferencia para nómina de empleados',
        detalles: {
          cuentaOrigen: '100000000004',
          numeroTransferencias: 25,
        },
        flagsRiesgo: ['Volumen alto'],
        notas: 'Aprobado - Operación comercial legítima',
        creadoEn: new Date(Date.now() - 172800000),
        actualizadoEn: new Date(Date.now() - 86400000),
        aprobadoPor: 'admin@banco.com',
        requiereVerificacionAdicional: false,
      },
    ];
    this.applyAllFilters();
    this.calculateStatistics();
    this.groupOperationsByDate();
    this.identifyCriticalOperations();
  }

  /**
   * Calcula estadísticas
   */
  calculateStatistics() {
    this.pendingCount = this.operations.filter(
      (op) => op.estado === 'Pendiente'
    ).length;
    this.blockedCount = this.operations.filter(
      (op) => op.estado === 'Bloqueada'
    ).length;
    this.criticalCount = this.operations.filter(
      (op) => op.nivelRiesgo === 'Crítico'
    ).length;
    this.highRiskCount = this.operations.filter(
      (op) => op.nivelRiesgo === 'Alto' || op.nivelRiesgo === 'Crítico'
    ).length;
    this.totalVolume = this.operations.reduce((sum, op) => sum + op.monto, 0);
  }

  /**
   * Agrupa operaciones por fecha
   */
  groupOperationsByDate() {
    const groups: { [key: string]: HighValueOperation[] } = {};

    this.filteredOperations.forEach((operation) => {
      const date = new Date(operation.creadoEn);
      const key = date.toDateString();

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(operation);
    });

    this.groupedOperations = Object.keys(groups)
      .map((key) => ({
        date: new Date(key),
        operations: groups[key].sort(
          (a, b) =>
            new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
        ),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Identifica operaciones críticas
   */
  identifyCriticalOperations() {
    this.criticalOperations = this.operations.filter(
      (op) => op.nivelRiesgo === 'Crítico' && op.estado !== 'Aprobada'
    );
  }

  filterOperations() {
    this.applyAllFilters();
    this.groupOperationsByDate();
  }

  /**
   * Aplica todos los filtros (estado + filtros avanzados)
   */
  applyAllFilters() {
    let filtered = [...this.operations];

    // Filtro por estado del segmento
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((op) => op.estado === this.selectedStatus);
    }

    // Filtro de monto mínimo
    if (
      this.activeFilters.minAmount !== undefined &&
      this.activeFilters.minAmount !== null
    ) {
      filtered = filtered.filter(
        (op) => op.monto >= this.activeFilters.minAmount!
      );
    }

    // Filtro de monto máximo
    if (
      this.activeFilters.maxAmount !== undefined &&
      this.activeFilters.maxAmount !== null
    ) {
      filtered = filtered.filter(
        (op) => op.monto <= this.activeFilters.maxAmount!
      );
    }

    // Filtro de nivel de riesgo
    if (this.activeFilters.riskLevel && this.activeFilters.riskLevel !== '') {
      filtered = filtered.filter(
        (op) =>
          op.nivelRiesgo.toLowerCase() ===
          this.activeFilters.riskLevel!.toLowerCase()
      );
    }

    // Filtro de tipo de operación
    if (
      this.activeFilters.operationType &&
      this.activeFilters.operationType !== ''
    ) {
      filtered = filtered.filter((op) =>
        op.tipo
          .toLowerCase()
          .includes(this.activeFilters.operationType!.toLowerCase())
      );
    }

    this.filteredOperations = filtered;
  }

  getOperationIcon(tipo: string): string {
    switch (tipo) {
      case 'Transferencia Masiva':
        return 'swap-horizontal';
      case 'Transferencia Internacional':
        return 'globe';
      case 'Retiro de Efectivo Grande':
        return 'cash';
      case 'Depósito Masivo':
        return 'download';
      case 'Operación Sospechosa':
        return 'alert-circle';
      case 'Cambio de Límite':
        return 'trending-up';
      case 'Cierre de Cuenta':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Verificada':
        return 'primary';
      case 'Aprobada':
        return 'success';
      case 'Rechazada':
        return 'danger';
      case 'Bloqueada':
        return 'dark';
      case 'Completada':
        return 'success';
      default:
        return 'medium';
    }
  }

  getRiskColor(nivel: string): string {
    switch (nivel) {
      case 'Bajo':
        return 'success';
      case 'Medio':
        return 'primary';
      case 'Alto':
        return 'warning';
      case 'Crítico':
        return 'danger';
      default:
        return 'medium';
    }
  }

  get totalVolumeFormatted(): string {
    if (this.totalVolume >= 1000000) {
      return (this.totalVolume / 1000000).toFixed(1) + 'M';
    }
    return (this.totalVolume / 1000).toFixed(0) + 'K';
  }

  async openOperationDetail(operation: HighValueOperation) {
    const modal = await this.modalCtrl.create({
      component: OperationDetailModalComponent,
      componentProps: {
        operation: operation,
      },
      cssClass: 'operation-detail-modal',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (
      data?.action === 'approved' ||
      data?.action === 'rejected' ||
      data?.action === 'blocked'
    ) {
      this.loadOperations();
    }
  }

  async quickApprove(operation: HighValueOperation) {
    const alert = await this.alertCtrl.create({
      header: 'Aprobar Rápidamente',
      message: `Aprobar operación de ${
        operation.moneda
      } ${operation.monto.toLocaleString()}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aprobar',
          handler: async () => {
            await this.executeApprove(operation);
          },
        },
      ],
    });
    await alert.present();
  }

  async executeApprove(operation: HighValueOperation) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Aprobando...',
      });
      await loading.present();

      await this.operationService
        .approveOperation({
          operacionId: operation.id,
        })
        .toPromise();

      await loading.dismiss();
      await this.showToast('Operación aprobada', 'success');
      this.loadOperations();
    } catch (error) {
      await this.showToast('Error al aprobar', 'danger');
    }
  }

  async quickReject(operation: HighValueOperation) {
    const alert = await this.alertCtrl.create({
      header: 'Rechazar Operación',
      message: 'Ingrese el motivo del rechazo',
      inputs: [
        {
          name: 'razon',
          type: 'textarea',
          placeholder: 'Motivo (requerido)',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rechazar',
          handler: async (data) => {
            if (!data.razon.trim()) {
              await this.showToast('Ingrese una razón', 'warning');
              return false;
            }
            await this.executeReject(operation, data.razon);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async executeReject(operation: HighValueOperation, razon: string) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Rechazando...',
      });
      await loading.present();

      await this.operationService
        .rejectOperation({
          operacionId: operation.id,
          razon,
        })
        .toPromise();

      await loading.dismiss();
      await this.showToast('Operación rechazada', 'success');
      this.loadOperations();
    } catch (error) {
      await this.showToast('Error al rechazar', 'danger');
    }
  }

  async blockOperation(operation: HighValueOperation) {
    const alert = await this.alertCtrl.create({
      header: 'Bloquear Operación',
      message: 'Ingrese el motivo del bloqueo',
      inputs: [
        {
          name: 'razon',
          type: 'textarea',
          placeholder: 'Motivo (requerido)',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Bloquear',
          handler: async (data) => {
            if (!data.razon.trim()) {
              await this.showToast('Ingrese una razón', 'warning');
              return false;
            }
            await this.executeBlock(operation, data.razon);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async executeBlock(operation: HighValueOperation, razon: string) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Bloqueando...',
      });
      await loading.present();

      await this.operationService
        .blockOperation({
          operacionId: operation.id,
          razon,
        })
        .toPromise();

      await loading.dismiss();
      await this.showToast('Operación bloqueada', 'success');
      this.loadOperations();
    } catch (error) {
      await this.showToast('Error al bloquear', 'danger');
    }
  }

  async openFilterModal() {
    // Obtener tipos únicos de operaciones dinámicamente
    const operationTypes = [
      ...new Set(this.operations.map((op) => op.tipo)),
    ].sort();

    // Niveles de riesgo disponibles
    const riskLevels = ['Bajo', 'Medio', 'Alto', 'Crítico'];

    // PASO 1: Filtros de monto
    const amountAlert = await this.alertCtrl.create({
      header: 'Filtrar por Monto',
      message: 'Ingrese el rango de montos (opcional)',
      cssClass: 'filter-alert',
      inputs: [
        {
          name: 'minAmount',
          type: 'number',
          placeholder: 'Monto Mínimo (CRC)',
          value: this.activeFilters?.minAmount || '',
          cssClass: 'filter-input',
        },
        {
          name: 'maxAmount',
          type: 'number',
          placeholder: 'Monto Máximo (CRC)',
          value: this.activeFilters?.maxAmount || '',
          cssClass: 'filter-input',
        },
      ],
      buttons: [
        {
          text: 'Limpiar Todo',
          cssClass: 'alert-button-clear',
          handler: () => {
            this.activeFilters = {};
            this.applyAllFilters();
            this.groupOperationsByDate();
            this.showToast('Filtros eliminados', 'primary');
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Siguiente',
          cssClass: 'alert-button-next',
          handler: async (amountData) => {
            // Guardar filtros de monto
            this.activeFilters.minAmount = amountData.minAmount
              ? parseFloat(amountData.minAmount)
              : undefined;
            this.activeFilters.maxAmount = amountData.maxAmount
              ? parseFloat(amountData.maxAmount)
              : undefined;

            // PASO 2: Filtro de Nivel de Riesgo
            const riskAlert = await this.alertCtrl.create({
              header: 'Filtrar por Nivel de Riesgo',
              message: 'Seleccione un nivel de riesgo',
              cssClass: 'filter-alert risk-alert',
              inputs: [
                {
                  name: 'riskLevel',
                  type: 'radio',
                  label: '✓ Todos los niveles',
                  value: '',
                  checked: !this.activeFilters?.riskLevel,
                  cssClass: 'filter-radio-all',
                },
                ...riskLevels.map((level) => ({
                  name: 'riskLevel',
                  type: 'radio' as const,
                  label: level,
                  value: level,
                  checked: this.activeFilters?.riskLevel === level,
                  cssClass: `filter-radio-${level.toLowerCase()}`,
                })),
              ],
              buttons: [
                {
                  text: 'Atrás',
                  cssClass: 'alert-button-back',
                  handler: () => {
                    this.openFilterModal();
                  },
                },
                {
                  text: 'Siguiente',
                  cssClass: 'alert-button-next',
                  handler: async (riskData) => {
                    this.activeFilters.riskLevel = riskData || '';

                    // PASO 3: Filtro de Tipo de Operación
                    const typeAlert = await this.alertCtrl.create({
                      header: 'Filtrar por Tipo de Operación',
                      message: 'Seleccione un tipo de operación',
                      cssClass: 'filter-alert type-alert',
                      inputs: [
                        {
                          name: 'operationType',
                          type: 'radio',
                          label: '✓ Todos los tipos',
                          value: '',
                          checked: !this.activeFilters?.operationType,
                          cssClass: 'filter-radio-all',
                        },
                        ...operationTypes.map((type) => ({
                          name: 'operationType',
                          type: 'radio' as const,
                          label: type,
                          value: type,
                          checked: this.activeFilters?.operationType === type,
                          cssClass: 'filter-radio-type',
                        })),
                      ],
                      buttons: [
                        {
                          text: 'Atrás',
                          cssClass: 'alert-button-back',
                          handler: async () => {
                            await riskAlert.present();
                          },
                        },
                        {
                          text: 'Aplicar',
                          cssClass: 'alert-button-apply',
                          handler: (typeData) => {
                            this.activeFilters.operationType = typeData || '';

                            this.applyAllFilters();
                            this.groupOperationsByDate();

                            const filtersApplied = [];
                            if (this.activeFilters.minAmount)
                              filtersApplied.push(
                                `Mín: ₡${this.activeFilters.minAmount.toLocaleString()}`
                              );
                            if (this.activeFilters.maxAmount)
                              filtersApplied.push(
                                `Máx: ₡${this.activeFilters.maxAmount.toLocaleString()}`
                              );
                            if (this.activeFilters.riskLevel)
                              filtersApplied.push(this.activeFilters.riskLevel);
                            if (this.activeFilters.operationType)
                              filtersApplied.push(
                                this.activeFilters.operationType
                              );

                            const message =
                              filtersApplied.length > 0
                                ? `✓ ${filtersApplied.length} filtro(s) aplicado(s)`
                                : 'Sin filtros activos';

                            this.showToast(message, 'success');
                          },
                        },
                      ],
                    });
                    await typeAlert.present();
                  },
                },
              ],
            });
            await riskAlert.present();
          },
        },
      ],
    });

    await amountAlert.present();
  }

  getEmptyMessage(): string {
    switch (this.selectedStatus) {
      case 'Pendiente':
        return 'No hay operaciones pendientes';
      case 'Bloqueada':
        return 'No hay operaciones bloqueadas';
      case 'Aprobada':
        return 'No hay operaciones aprobadas';
      default:
        return 'No se encontraron operaciones';
    }
  }

  async handleRefresh(event: any) {
    await this.loadOperations();
    event.target.complete();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await toast.present();
  }
  getActiveFiltersCount(): number {
    let count = 0;
    if (
      this.activeFilters.minAmount !== undefined &&
      this.activeFilters.minAmount !== null
    )
      count++;
    if (
      this.activeFilters.maxAmount !== undefined &&
      this.activeFilters.maxAmount !== null
    )
      count++;
    if (this.activeFilters.riskLevel) count++;
    if (this.activeFilters.operationType) count++;
    return count;
  }
}