import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminRoutingModule } from './admin-routing.module';
import { CreateUserModalComponent } from './users/create-user-modal/create-user-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminRoutingModule,
    CreateUserModalComponent
  ]
})
export class AdminModule { }