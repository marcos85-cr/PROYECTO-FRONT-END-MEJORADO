import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, AfterContentChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CardPage implements OnInit, AfterContentChecked {
  cards: any[] = [];

  bannerConfig: SwiperOptions = {
    slidesPerView: 1.2,
    spaceBetween: 10,
    centeredSlides: true,
    loop: false,
  };

  constructor() {}

  ngOnInit() {
    this.cards = [
      {
        card_no: '3456 8715 6874 1234',
        card_holder: 'JUAN PEREZ',
        exp_date: '12/25',
        company_img: '/assets/icon/visa.png',
      },
      {
        card_no: '5796 2548 3478 5678',
        card_holder: 'MARIA LOPEZ',
        exp_date: '08/26',
        company_img: '/assets/icon/mastercard.png',
      },
      {
        card_no: '4687 8475 2753 9012',
        card_holder: 'CARLOS SANCHEZ',
        exp_date: '11/28',
        company_img: '/assets/icon/american.png',
      },
    ];
  }
  ngAfterContentChecked() {
    this.bannerConfig = {
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 40,
      pagination: { clickable: true },
    };
  }
}
