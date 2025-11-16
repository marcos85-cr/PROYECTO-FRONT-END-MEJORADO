import {
  Component,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterContentChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';
import { RouterModule } from '@angular/router';


register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit, AfterContentChecked {
  account: any[] = []; /* Arreglo para almacenar los datos de la cuenta */
  bannerConfig: SwiperOptions = {};
  featureConfig: SwiperOptions = {};
  features: any[] = [];
  transactions: any[] = [];

  constructor() {}

  /* Inicialización de datos al cargar el componente */
  ngOnInit() {
    this.account = [
      { id: 1, acc_no: '1234567890', acc_type: 'Checking', balance: '2500.75' },
      { id: 2, acc_no: '0987654321', acc_type: 'Savings', balance: '10500.00' },
      { id: 3, acc_no: '1122334455', acc_type: 'Investment', balance: '50000.50' }
    ];

    this.features = [
      {
        id: 1,
        color: 'secondary', icon: 'swap-vertical-outline', name: 'Enviar',},
      { id: 2, color: 'primary', icon: 'download-outline', name: 'Traer' },
      { id: 3, color: 'success', icon: 'arrow-redo-outline', name: 'Sinpe' },
      
    ];

    this.transactions = [
      { id: 1, to: 'Pedro Sanchez', date: '2025-05-22', amount: 5000 },
      { id: 2, to: 'Marta Porras', date: '2025-03-02', amount: 7000 },
      { id: 3, to: 'Ezequiel Santos', date: '2025-07-28', amount: -3250 },
      { id: 4, to: 'Tomas Cerrano.', date: '2025-01-09', amount: 1000 },
      { id: 5, to: 'Juan Perez', date: '2025-04-13', amount: -800 },
    ];
  }

  ngAfterContentChecked() {
    this.bannerConfig = {
      slidesPerView: 1,
      pagination: { clickable: true },
    };
    this.featureConfig = {
      slidesPerView: 3.5,
    };
  }
}
