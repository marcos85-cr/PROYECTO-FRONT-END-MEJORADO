import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  AlertController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { ServicePaymentService } from '../../../services/service-payment.service';
import {
  ServiceProvider,
  ServiceType,
  ValidationRule,
} from '../../../models/service-payment.model';
import { CreateProviderModalComponent } from './create-provider-modal/create-provider-modal.component';
import { ProviderDetailModalComponent } from './provider-detail-modal/provider-detail-modal.component';

@Component({
  selector: 'app-service-providers',
  templateUrl: './service-providers.page.html',
  styleUrls: ['./service-providers.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ServiceProvidersPage implements OnInit {
  providers: ServiceProvider[] = [];
  filteredProviders: ServiceProvider[] = [];
  searchTerm: string = '';
  selectedType: string = 'all';
  isLoading = false;

  stats = {
    total: 0,
    active: 0,
    types: 0,
  };

  constructor(
    private servicePaymentService: ServicePaymentService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadProviders();
  }

  async loadProviders() {
    this.isLoading = true;
    try {
      const providers = await this.servicePaymentService
        .getServiceProviders()
        .toPromise();
      this.providers = providers || [];
      this.filteredProviders = [...this.providers];
      this.calculateStats();
    } catch (error) {
      console.error('Error loading providers:', error);
      await this.showToast('Error al cargar proveedores', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  calculateStats() {
    this.stats.total = this.providers.length;
    this.stats.active = this.providers.filter((p) => p.activo).length;
    this.stats.types = new Set(this.providers.map((p) => p.tipo)).size;
  }

  filterProviders() {
    let filtered = [...this.providers];

    // Filtrar por tipo
    if (this.selectedType !== 'all') {
      filtered = filtered.filter((p) => p.tipo === this.selectedType);
    }

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.codigoEmpresa.toLowerCase().includes(term) ||
          p.descripcion?.toLowerCase().includes(term)
      );
    }

    this.filteredProviders = filtered;
  }

  getTypeColor(tipo: ServiceType): string {
    switch (tipo) {
      case ServiceType.AGUA:
        return 'primary';
      case ServiceType.ELECTRICIDAD:
        return 'warning';
      case ServiceType.TELEFONIA:
        return 'success';
      case ServiceType.MUNICIPALIDADES:
        return 'tertiary';
      case ServiceType.COBRO_JUDICIAL:
        return 'danger';
      default:
        return 'medium';
    }
  }

  getValidationSummary(rules: ValidationRule): string {
    if (rules.exactLength) {
      return `${rules.exactLength} dígitos`;
    }
    if (rules.minLength && rules.maxLength) {
      return `${rules.minLength}-${rules.maxLength} dígitos`;
    }
    if (rules.minLength) {
      return `Min: ${rules.minLength}`;
    }
    if (rules.maxLength) {
      return `Max: ${rules.maxLength}`;
    }
    return 'Sin reglas';
  }

  async openCreateProviderModal() {
    const modal = await this.modalController.create({
      component: CreateProviderModalComponent,
      cssClass: 'provider-modal',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.created) {
      await this.loadProviders();
      await this.showToast('Proveedor creado exitosamente', 'success');
    }
  }

  async openProviderDetail(provider: ServiceProvider) {
    const modal = await this.modalController.create({
      component: ProviderDetailModalComponent,
      componentProps: {
        provider: provider,
      },
      cssClass: 'provider-detail-modal',
    });

    await modal.present();
  }

  getValidationDetails(rules?: ValidationRule): string {
    if (!rules) return 'Sin reglas definidas';

    const details: string[] = [];

    if (rules.exactLength) {
      details.push(`• Longitud exacta: ${rules.exactLength} caracteres`);
    } else {
      if (rules.minLength)
        details.push(`• Mínimo: ${rules.minLength} caracteres`);
      if (rules.maxLength)
        details.push(`• Máximo: ${rules.maxLength} caracteres`);
    }

    if (rules.allowNumbers && !rules.allowLetters) {
      details.push('• Solo números');
    } else if (rules.allowLetters && rules.allowNumbers) {
      details.push('• Números y letras');
    }

    if (rules.customMessage) {
      details.push(`• Mensaje: ${rules.customMessage}`);
    }

    return details.join('<br>');
  }

  async editProvider(provider: ServiceProvider) {
    const modal = await this.modalController.create({
      component: CreateProviderModalComponent,
      componentProps: {
        provider: provider,
        isEdit: true,
      },
      cssClass: 'provider-modal',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      await this.loadProviders();
      await this.showToast('Proveedor actualizado exitosamente', 'success');
    }
  }

  async toggleProviderStatus(provider: ServiceProvider) {
    const action = provider.activo ? 'desactivar' : 'activar';

    const alert = await this.alertController.create({
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Proveedor`,
      message: `¿Está seguro de ${action} a ${provider.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: async () => {
            try {
              await this.servicePaymentService
                .updateServiceProvider(provider.id, {
                  activo: !provider.activo,
                })
                .toPromise();

              await this.loadProviders();
              await this.showToast(`Proveedor ${action}do`, 'success');
            } catch (error) {
              await this.showToast(`Error al ${action} proveedor`, 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteProvider(provider: ServiceProvider) {
    const alert = await this.alertController.create({
      header: 'Eliminar Proveedor',
      message: `¿Está seguro de eliminar a ${provider.nombre}? Esta acción no se puede deshacer.`,
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
              await this.servicePaymentService
                .deleteServiceProvider(provider.id)
                .toPromise();
              await this.loadProviders();
              await this.showToast('Proveedor eliminado', 'success');
            } catch (error) {
              await this.showToast('Error al eliminar proveedor', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async handleRefresh(event: any) {
    await this.loadProviders();
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
