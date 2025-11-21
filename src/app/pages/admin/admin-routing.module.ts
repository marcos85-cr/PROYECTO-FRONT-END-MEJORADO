import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.page').then((m) => m.UsersPage),
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./accounts/accounts.page').then((m) => m.AccountsPage),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/reports.page').then((m) => m.ReportsPage),
  },
  {
    path: 'operations',
    loadComponent: () =>
      import('./operations/operations.page').then((m) => m.OperationsPage),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./clients/clients.page').then((m) => m.ClientsPage),
  },
  // ✅ NUEVA RUTA
  {
    path: 'service-providers',
    loadComponent: () =>
      import('./service-providers/service-providers.page').then(
        (m) => m.ServiceProvidersPage
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.page').then((m) => m.SettingsPage),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
