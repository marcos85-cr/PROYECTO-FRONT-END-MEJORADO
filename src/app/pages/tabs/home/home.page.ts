import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit {

  account: any[] = []; /* Arreglo para almacenar los datos de la cuenta */

  constructor() { }

  ngOnInit() {
    this.account = [
      { id: 1, acc_no: '1234567890', acc_type: 'Checking', balance: '2500.75' },
      { id: 2, acc_no: '0987654321', acc_type: 'Savings', balance: '10500.00' },
      { id: 3, acc_no: '1122334455', acc_type: 'Investment', balance: '50000.50' }

    ];
  }

}
