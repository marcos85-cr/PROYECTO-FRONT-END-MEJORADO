import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import {
  ServiceProvider,
  ServiceType,
} from '../../../models/service-payment.model';
import { ServicePaymentService } from '../../../services/service-payment.service';
import { ServicePaymentModalComponent } from '../../../components/service-payment-modal/service-payment-modal.component';

interface ServiceCategory {
  type: ServiceType;
  name: string;
  icon: string;
  color: string;
  providers: ServiceProvider[];
  expanded?: boolean; // Nuevo: para controlar expansión
}

@Component({
  selector: 'app-cash',
  templateUrl: './cash.page.html',
  styleUrls: ['./cash.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CashPage implements OnInit {
  categories: ServiceCategory[] = [];
  allProviders: ServiceProvider[] = [];
  loading: boolean = true;
  searchTerm: string = '';
  filteredCategories: ServiceCategory[] = [];

  constructor(
    private servicePaymentService: ServicePaymentService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadServiceProviders();
  }

  loadServiceProviders() {
    this.loading = true;
    this.servicePaymentService.getServiceProviders().subscribe({
      next: (providers) => {
        this.allProviders = providers;
        this.organizeProvidersByCategory();
        this.filteredCategories = [...this.categories];
        // Expandir todas las categorías por defecto
        this.filteredCategories.forEach((cat) => (cat.expanded = true));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.loading = false;
      },
    });
  }

  organizeProvidersByCategory() {
    const categoryConfig = [
      {
        type: ServiceType.AGUA,
        name: 'Agua',
        icon: 'water-outline',
        color: 'primary',
      },
      {
        type: ServiceType.ELECTRICIDAD,
        name: 'Electricidad',
        icon: 'flash-outline',
        color: 'warning',
      },
      {
        type: ServiceType.TELEFONIA,
        name: 'Telefonía',
        icon: 'call-outline',
        color: 'success',
      },
      {
        type: ServiceType.MUNICIPALIDADES,
        name: 'Municipalidades',
        icon: 'business-outline',
        color: 'tertiary',
      },
      {
        type: ServiceType.COBRO_JUDICIAL,
        name: 'Cobro Judicial',
        icon: 'document-text-outline',
        color: 'danger',
      },
    ];

    this.categories = categoryConfig
      .map((config) => ({
        ...config,
        providers: this.allProviders.filter((p) => p.tipo === config.type),
        expanded: true,
      }))
      .filter((category) => category.providers.length > 0);
  }

  async openPaymentModal(provider: ServiceProvider) {
    const modal = await this.modalCtrl.create({
      component: ServicePaymentModalComponent,
      componentProps: {
        provider: provider,
      },
      cssClass: 'payment-modal',
      breakpoints: [0, 0.5, 0.75, 1],
      initialBreakpoint: 0.75,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.success) {
      console.log('Pago realizado exitosamente:', data.payment);
      // Opcional: Mostrar toast de éxito
      this.showSuccessToast();
    }
  }

  filterProviders() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredCategories = [...this.categories];
      // Mantener estado expandido
      this.filteredCategories.forEach((cat) => (cat.expanded = true));
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories
      .map((category) => ({
        ...category,
        providers: category.providers.filter(
          (provider) =>
            provider.nombre.toLowerCase().includes(term) ||
            provider.tipo.toLowerCase().includes(term)
        ),
        expanded: true, // Expandir automáticamente al buscar
      }))
      .filter((category) => category.providers.length > 0);
  }

  handleRefresh(event: any) {
    this.loadServiceProviders();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getProviderCount(category: ServiceCategory): number {
    return category.providers.length;
  }

  getTotalProviders(): number {
    return this.filteredCategories.reduce(
      (total, category) => total + category.providers.length,
      0
    );
  }

  toggleCategory(category: ServiceCategory) {
    category.expanded = !category.expanded;
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterProviders();
  }

  private async showSuccessToast() {
    // Implementar toast de éxito (opcional)
    // Requiere ToastController
  }
}
