// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
  },
  
  // 🔓 ACCESO LIBRE - Rutas de Cliente
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
    // canActivate: [AuthGuard, RoleGuard], // Deshabilitado para acceso libre
    // data: { roles: ['Cliente'] },
  },
  
  // 🔓 ACCESO LIBRE - Rutas de Administrador  
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.module').then((m) => m.AdminModule),
    // canActivate: [AuthGuard, RoleGuard], // Deshabilitado para acceso libre
    // data: { roles: ['Administrador'] },
  },
  
  // 🔓 ACCESO LIBRE - Rutas de Gestor
  {
    path: 'gestor',
    loadChildren: () =>
      import('./pages/gestor/gestor.module').then((m) => m.GestorModule),
    // canActivate: [AuthGuard, RoleGuard], // Deshabilitado para acceso libre
    // data: { roles: ['Gestor'] },
  },
  
  // 🔓 ACCESO LIBRE - Páginas adicionales de Cliente
  {
    path: 'cliente',
    children: [
      {
        path: 'transfer',
        loadComponent: () =>
          import('./pages/cliente/transfer.page').then((m) => m.TransferPage),
        // canActivate: [AuthGuard, RoleGuard], // Deshabilitado para acceso libre
        // data: { roles: ['Cliente'] },
      },
      {
        path: 'beneficiaries',
        loadComponent: () =>
          import('./pages/cliente/beneficiaries/beneficiaries.page').then(
            (m) => m.BeneficiariesPage
          ),
        // canActivate: [AuthGuard, RoleGuard], // Deshabilitado para acceso libre
        // data: { roles: ['Cliente'] },
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./pages/cliente/payments/payments.page').then(
            (m) => m.PaymentsPage
          ),
        // canActivate: [AuthGuard, RoleGuard], // Deshabilitado para acceso libre  
        // data: { roles: ['Cliente'] },
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/cliente/history/history.page').then(
            (m) => m.HistoryPage
          ),
        // canActivate: [AuthGuard, RoleGuard], // Deshabilitado para acceso libre
        // data: { roles: ['Cliente'] },
      },
    ],
  },

  // 🏠 PÁGINAS DE NAVEGACIÓN Y AYUDA
  {
    path: 'test-users',
    loadComponent: () =>
      import('./pages/test-users.page').then((m) => m.TestUsersPage),
  },
];



@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
