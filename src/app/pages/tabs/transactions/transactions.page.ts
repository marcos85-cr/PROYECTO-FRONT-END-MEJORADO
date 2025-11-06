import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TransactionsPage implements OnInit {
  alltransactions: any[] = [];
  transactions: any[] = [];
  segmentValue: string = 'in';

  constructor() {}

  ngOnInit() {
    this.alltransactions = [
      { id: 1, to: 'Pedro Sanchez', date: '2025-05-22', amount: 5000 },
      { id: 2, to: 'Marta Porras', date: '2025-03-02', amount: 7000 },
      { id: 3, to: 'Ezequiel Santos', date: '2025-07-28', amount: -3250 },
      { id: 4, to: 'Tomas Cerrano.', date: '2025-01-09', amount: 1000 },
      { id: 5, to: 'Juan Perez', date: '2025-04-13', amount: -800 },
    ];
    this.filterTransactions();
  }
    /* Filtra las transacciones según el segmento seleccionado */
  filterTransactions() {
    if(this.segmentValue === 'in') {
      this.transactions = this.alltransactions.filter(x => x.amount >= 0);
    } else {
      this.transactions = this.alltransactions.filter(x => x.amount < 0);
    }
  }
    /* Maneja el cambio de segmento */
  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
    console.log(event);
    this.filterTransactions();
  }
}
