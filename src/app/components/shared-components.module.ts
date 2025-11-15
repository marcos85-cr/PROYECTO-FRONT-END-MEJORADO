import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ServicePaymentModalComponent } from './service-payment-modal/service-payment-modal.component';
import { AccountDetailModalComponent } from './account-detail-modal/account-detail-modal.component';
import { BeneficiaryDetailModalComponent } from './beneficiary-detail-modal/beneficiary-detail-modal.component';
import { ClientAccountsModalComponent } from './client-accounts-modal/client-accounts-modal.component';
import { ClientDetailModalComponent } from './client-detail-modal/client-detail-modal.component';
import { ClientTransactionsModalComponent } from './client-transactions-modal/client-transactions-modal.component';
import { TransactionDetailModalComponent } from './transaction-detail-modal/transaction-detail-modal.component';
import { UserDetailModalComponent } from './user-detail-modal/user-detail-modal.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServicePaymentModalComponent,
    AccountDetailModalComponent,
    BeneficiaryDetailModalComponent,
    ClientAccountsModalComponent,
    ClientDetailModalComponent,
    ClientTransactionsModalComponent,
    TransactionDetailModalComponent,
    UserDetailModalComponent
  ],
  exports: [
    ServicePaymentModalComponent,
    AccountDetailModalComponent,
    BeneficiaryDetailModalComponent,
    ClientAccountsModalComponent,
    ClientDetailModalComponent,
    ClientTransactionsModalComponent,
    TransactionDetailModalComponent,
    UserDetailModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedComponentsModule {}
