import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { BeneficiaryService } from '../../../services/beneficiary.service';
import {
  Beneficiary,
  BeneficiaryStatus,
} from '../../../models/beneficiary.model';
import { BeneficiaryDetailModalComponent } from '../../../components/beneficiary-detail-modal/beneficiary-detail-modal.component';

@Component({
  selector: 'app-beneficiaries',
  templateUrl: './beneficiaries.page.html',
  styleUrls: ['./beneficiaries.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class BeneficiariesPage implements OnInit {
  beneficiaries: Beneficiary[] = [];
  filteredBeneficiaries: Beneficiary[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  isLoading = false;

  constructor(
    private beneficiaryService: BeneficiaryService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadBeneficiaries();
  }

  async loadBeneficiaries() {
    this.isLoading = true;
    try {
      this.beneficiaryService.getMyBeneficiaries().subscribe({
        next: (data) => {
          this.beneficiaries = data;
          this.filteredBeneficiaries = [...this.beneficiaries];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading beneficiaries:', error);
          this.isLoading = false;
          // Datos simulados como fallback
          this.loadMockBeneficiaries();
        }
      });
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
      this.isLoading = false;
      this.loadMockBeneficiaries();
    }
  }

  private loadMockBeneficiaries() {
    this.beneficiaries = [
      {
        id: '1',
        clienteId: '1',
        alias: 'Mamá',
        banco: 'Banco Nacional',
        numeroCuenta: '100200300400',
        moneda: 'CRC',
        pais: 'Costa Rica',
        estado: BeneficiaryStatus.ACTIVO,
        fechaCreacion: new Date('2025-10-15'),
        tieneOperacionesPendientes: false,
      },
      {
        id: '2',
        clienteId: '1',
        alias: 'Hermano Juan',
        banco: 'BAC San José',
        numeroCuenta: '200300400500',
        moneda: 'USD',
        pais: 'Costa Rica',
        estado: BeneficiaryStatus.ACTIVO,
        fechaCreacion: new Date('2025-09-20'),
        tieneOperacionesPendientes: false,
      },
      {
        id: '3',
        clienteId: '1',
        alias: 'Proveedor XYZ',
        banco: 'Banco de Costa Rica',
        numeroCuenta: '300400500600',
        moneda: 'CRC',
        pais: 'Costa Rica',
        estado: BeneficiaryStatus.ACTIVO,
        fechaCreacion: new Date('2025-08-10'),
        tieneOperacionesPendientes: true, 
      },
      {
        id: '4',
        clienteId: '1',
        alias: 'Tía María',
        banco: 'Banco Popular',
        numeroCuenta: '400500600700',
        moneda: 'CRC',
        pais: 'Costa Rica',
        estado: BeneficiaryStatus.PENDIENTE_CONFIRMACION,
        fechaCreacion: new Date('2025-11-08'),
        tieneOperacionesPendientes: false,
      },
      {
        id: '5',
        clienteId: '1',
        alias: 'Socio Comercial',
        banco: 'Scotiabank',
        numeroCuenta: '500600700800',
        moneda: 'USD',
        pais: 'Costa Rica',
        estado: BeneficiaryStatus.ACTIVO,
        fechaCreacion: new Date('2025-07-05'),
        tieneOperacionesPendientes: false,
      },
    ];
    this.filteredBeneficiaries = [...this.beneficiaries];
  }

  filterBeneficiaries() {
    let filtered = [...this.beneficiaries];

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((b) => b.estado === this.selectedStatus);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.alias.toLowerCase().includes(term) ||
          b.banco.toLowerCase().includes(term) ||
          b.numeroCuenta.includes(term)
      );
    }

    this.filteredBeneficiaries = filtered;
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.filterBeneficiaries();
  }

  getStatusColor(estado: BeneficiaryStatus): string {
    switch (estado) {
      case BeneficiaryStatus.ACTIVO:
        return 'success';
      case BeneficiaryStatus.PENDIENTE_CONFIRMACION:
        return 'warning';
      case BeneficiaryStatus.INACTIVO:
        return 'medium';
      default:
        return 'medium';
    }
  }

  async openCreateModal() {
    const alert = await this.alertController.create({
      header: 'Nuevo Beneficiario',
      inputs: [
        {
          name: 'alias',
          type: 'text',
          placeholder: 'Alias (ej: Mamá, Juan, etc.)',
          attributes: {
            minlength: 3,
            maxlength: 30,
          },
        },
        {
          name: 'banco',
          type: 'text',
          placeholder: 'Banco',
        },
        {
          name: 'numeroCuenta',
          type: 'text',
          placeholder: 'Número de Cuenta',
          attributes: {
            minlength: 12,
            maxlength: 20,
          },
        },
        {
          name: 'moneda',
          type: 'text',
          placeholder: 'Moneda (CRC o USD)',
          value: 'CRC',
        },
        {
          name: 'pais',
          type: 'text',
          placeholder: 'País',
          value: 'Costa Rica',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Crear',
          handler: async (data) => {
            if (!data.alias || data.alias.length < 3 || data.alias.length > 30) {
              await this.showToast(
                'El alias debe ser mayor de 3 y menor de 30 caracteres',
                'warning'
              );
              return false;
            }
            if (!data.banco || !data.numeroCuenta) {
              await this.showToast('Complete todos los campos', 'warning');
              return false;
            }
            if (
              data.numeroCuenta.length < 12 ||
              data.numeroCuenta.length > 20
            ) {
              await this.showToast(
                'El número de cuenta debe tener entre 12 y 20 dígitos',
                'warning'
              );
              return false;
            }
            if (data.moneda !== 'CRC' && data.moneda !== 'USD') {
              await this.showToast('La moneda debe ser CRC o USD', 'warning');
              return false;
            }

            if (
              this.beneficiaries.some(
                (b) => b.alias.toLowerCase() === data.alias.toLowerCase()
              )
            ) {
              await this.showToast(
                'Ya existe un beneficiario con ese alias',
                'warning'
              );
              return false;
            }

            await this.createBeneficiary(data);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async createBeneficiary(data: any) {
    try {
      this.beneficiaryService.createBeneficiary(data).subscribe({
        next: (newBeneficiary) => {
          this.beneficiaries.push(newBeneficiary);
          this.filterBeneficiaries();
          this.showToast('Beneficiario creado. Pendiente de confirmación.', 'success');
        },
        error: (error) => {
          console.error('Error creating beneficiary:', error);
          this.showToast('Error al crear beneficiario', 'danger');
        }
      });
    } catch (error) {
      console.error('Error creating beneficiary:', error);
      this.showToast('Error al crear beneficiario', 'danger');
    }
  }

  async viewBeneficiaryDetail(ben: Beneficiary) {
    const modal = await this.modalController.create({
      component: BeneficiaryDetailModalComponent,
      componentProps: {
        beneficiary: ben
      },
      cssClass: 'custom-modal-size'
    });
    
    return await modal.present();
  }

  async editBeneficiary(ben: Beneficiary) {
    const alert = await this.alertController.create({
      header: 'Editar Beneficiario',
      message: 'Cambiar el alias del beneficiario',
      inputs: [
        {
          name: 'alias',
          type: 'text',
          value: ben.alias,
          placeholder: 'Nuevo alias',
          attributes: {
            minlength: 3,
            maxlength: 30,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.alias || data.alias.length < 3) {
              await this.showToast(
                'El alias debe tener al menos 3 caracteres',
                'warning'
              );
              return false;
            }

            if (
              this.beneficiaries.some(
                (b) =>
                  b.id !== ben.id &&
                  b.alias.toLowerCase() === data.alias.toLowerCase()
              )
            ) {
              await this.showToast(
                'Ya existe un beneficiario con ese alias',
                'warning'
              );
              return false;
            }

            try {
              this.beneficiaryService.updateBeneficiary(ben.id, { alias: data.alias })
                .subscribe({
                  next: (updatedBeneficiary) => {
                    const index = this.beneficiaries.findIndex(b => b.id === ben.id);
                    if (index !== -1) {
                      this.beneficiaries[index] = updatedBeneficiary;
                      this.filterBeneficiaries();
                      this.showToast('Beneficiario actualizado', 'success');
                    }
                  },
                  error: (error) => {
                    console.error('Error updating beneficiary:', error);
                    this.showToast('Error al actualizar beneficiario', 'danger');
                  }
                });
            } catch (error) {
              console.error('Error updating beneficiary:', error);
              this.showToast('Error al actualizar beneficiario', 'danger');
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }


  async deleteBeneficiary(ben: Beneficiary) {
    if (ben.tieneOperacionesPendientes) {
      await this.showToast(
        'No se puede eliminar. Tiene operaciones programadas pendientes.',
        'warning'
      );
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar Beneficiario',
      message: `¿Está seguro de eliminar a ${ben.alias}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              this.beneficiaryService.deleteBeneficiary(ben.id)
                .subscribe({
                  next: (response) => {
                    if (response.success) {
                      this.beneficiaries = this.beneficiaries.filter(
                        (b) => b.id !== ben.id
                      );
                      this.filterBeneficiaries();
                      this.showToast('Beneficiario eliminado', 'success');
                    } else {
                      this.showToast(response.message || 'Error al eliminar', 'danger');
                    }
                  },
                  error: (error) => {
                    console.error('Error deleting beneficiary:', error);
                    this.showToast('Error al eliminar beneficiario', 'danger');
                  }
                });
            } catch (error) {
              console.error('Error deleting beneficiary:', error);
              this.showToast('Error al eliminar beneficiario', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async confirmBeneficiary(ben: Beneficiary) {
    const alert = await this.alertController.create({
      header: 'Confirmar Beneficiario',
      message: `¿Desea confirmar a ${ben.alias}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              this.beneficiaryService.confirmBeneficiary(ben.id)
                .subscribe({
                  next: (updatedBeneficiary) => {
                    const index = this.beneficiaries.findIndex(b => b.id === ben.id);
                    if (index !== -1) {
                      this.beneficiaries[index] = updatedBeneficiary;
                      this.filterBeneficiaries();
                      this.showToast(
                        'Beneficiario confirmado y activado',
                        'success'
                      );
                    }
                  },
                  error: (error) => {
                    console.error('Error confirming beneficiary:', error);
                    this.showToast('Error al confirmar beneficiario', 'danger');
                  }
                });
            } catch (error) {
              console.error('Error confirming beneficiary:', error);
              this.showToast('Error al confirmar beneficiario', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async handleRefresh(event: any) {
    await this.loadBeneficiaries();
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

  async openFilterModal() {
    const alert = await this.alertController.create({
      header: 'Filtrar Beneficiarios',
      inputs: [
        {
          name: 'alias',
          type: 'text',
          placeholder: 'Buscar por alias'
        },
        {
          name: 'banco',
          type: 'text',
          placeholder: 'Buscar por banco'
        },
        {
          name: 'pais',
          type: 'text',
          placeholder: 'Buscar por país'
        }
      ],
      buttons: [
        {
          text: 'Limpiar',
          role: 'cancel',
          handler: () => {
            this.clearFilters();
          }
        },
        {
          text: 'Aplicar',
          handler: (data) => {
            this.applyFilters(data);
          }
        }
      ]
    });
    await alert.present();
  }

  applyFilters(filters: any) {
    let filtered = [...this.beneficiaries];

    if (filters.alias && filters.alias.trim()) {
      const term = filters.alias.toLowerCase();
      filtered = filtered.filter(b => b.alias.toLowerCase().includes(term));
    }

    if (filters.banco && filters.banco.trim()) {
      const term = filters.banco.toLowerCase();
      filtered = filtered.filter(b => b.banco.toLowerCase().includes(term));
    }

    if (filters.pais && filters.pais.trim()) {
      const term = filters.pais.toLowerCase();
      filtered = filtered.filter(b => b.pais.toLowerCase().includes(term));
    }

    this.filteredBeneficiaries = filtered;
  }

  clearFilters() {
    this.filteredBeneficiaries = [...this.beneficiaries];
    this.showToast('Filtros eliminados', 'success');
}
}