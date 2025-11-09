

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./clients/clients.page').then(m => m.ClientsPage)
  },
  {
    path: 'operations',
    loadComponent: () =>
      import('./operations/operations.page').then(m => m.OperationsPage)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestorRoutingModule { }