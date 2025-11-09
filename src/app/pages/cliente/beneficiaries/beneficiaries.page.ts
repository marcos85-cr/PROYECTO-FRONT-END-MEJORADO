

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { BeneficiaryService } from '../../../services/beneficiary.service';
import {
  Beneficiary,
  BeneficiaryStatus,
} from '../../../models/beneficiary.model';

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
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadBeneficiaries();
  }

  async loadBeneficiaries() {
    this.isLoading = true;
    try {
      // En producción usar: this.beneficiaryService.getMyBeneficiaries().toPromise()
      // Datos simulados
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
      ] as Beneficiary[];

      this.filteredBeneficiaries = [...this.beneficiaries];
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
      await this.showToast('Error al cargar beneficiarios', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  filterBeneficiaries() {
    let filtered = [...this.beneficiaries];

    // Filtrar por estado
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((b) => b.estado === this.selectedStatus);
    }

    // Filtrar por término de búsqueda
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
            if (!data.alias || data.alias.length < 3) {
              await this.showToast(
                'El alias debe tener al menos 3 caracteres',
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

            // Validar alias duplicado
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
      // En producción usar: this.beneficiaryService.createBeneficiary(data).toPromise()

      const newBeneficiary: Beneficiary = {
        id: Date.now().toString(),
        clienteId: '1',
        alias: data.alias,
        banco: data.banco,
        numeroCuenta: data.numeroCuenta,
        moneda: data.moneda,
        pais: data.pais,
        estado: BeneficiaryStatus.PENDIENTE_CONFIRMACION,
        fechaCreacion: new Date(),
        tieneOperacionesPendientes: false,
      };

      this.beneficiaries.push(newBeneficiary);
      this.filterBeneficiaries();

      await this.showToast(
        'Beneficiario creado. Pendiente de confirmación.',
        'success'
      );
    } catch (error) {
      console.error('Error creating beneficiary:', error);
      await this.showToast('Error al crear beneficiario', 'danger');
    }
  }

  async viewBeneficiaryDetail(ben: Beneficiary) {
    const alert = await this.alertController.create({
      header: ben.alias,
      message: `
        <div class="beneficiary-detail">
          <p><strong>Banco:</strong> ${ben.banco}</p>
          <p><strong>Cuenta:</strong> ${ben.numeroCuenta}</p>
          <p><strong>Moneda:</strong> ${ben.moneda}</p>
          <p><strong>País:</strong> ${ben.pais}</p>
          <p><strong>Estado:</strong> ${ben.estado}</p>
          <p><strong>Fecha creación:</strong> ${new Date(
            ben.fechaCreacion
          ).toLocaleDateString()}</p>
        </div>
      `,
      buttons: ['Cerrar'],
    });
    await alert.present();
  }

  async editBeneficiary(ben: Beneficiary) {
    const alert = await this.alertController.create({
      header: 'Editar Beneficiario',
      message: 'Solo puede cambiar el alias del beneficiario',
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

            // Validar alias duplicado (excepto el actual)
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
              // En producción usar: this.beneficiaryService.updateBeneficiary(ben.id, data).toPromise()
              ben.alias = data.alias;
              this.filterBeneficiaries();
              await this.showToast('Beneficiario actualizado', 'success');
            } catch (error) {
              await this.showToast(
                'Error al actualizar beneficiario',
                'danger'
              );
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
      message: `¿Está seguro de eliminar a ${ben.alias}?`,
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
              // En producción usar: this.beneficiaryService.deleteBeneficiary(ben.id).toPromise()

              this.beneficiaries = this.beneficiaries.filter(
                (b) => b.id !== ben.id
              );
              this.filterBeneficiaries();
              await this.showToast('Beneficiario eliminado', 'success');
            } catch (error) {
              console.error('Error deleting beneficiary:', error);
              await this.showToast('Error al eliminar beneficiario', 'danger');
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
              // En producción usar: this.beneficiaryService.confirmBeneficiary(ben.id).toPromise()

              ben.estado = BeneficiaryStatus.ACTIVO;
              this.filterBeneficiaries();
              await this.showToast(
                'Beneficiario confirmado y activado',
                'success'
              );
            } catch (error) {
              console.error('Error confirming beneficiary:', error);
              await this.showToast('Error al confirmar beneficiario', 'danger');
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
}
