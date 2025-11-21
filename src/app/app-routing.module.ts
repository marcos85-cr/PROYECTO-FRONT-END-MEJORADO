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
  },

  // 🔓 ACCESO LIBRE - Rutas de Administrador
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.module').then((m) => m.AdminModule),
  },

  // 🔓 ACCESO LIBRE - Rutas de Gestor
  {
    path: 'gestor',
    loadChildren: () =>
      import('./pages/gestor/gestor.module').then((m) => m.GestorModule),
  },

  // 🔓 ACCESO LIBRE - Páginas adicionales de Cliente
  {
    path: 'cliente',
    children: [
      {
        path: 'transfer',
        loadComponent: () =>
          import('./pages/cliente/transfer.page').then((m) => m.TransferPage),
      },
      {
        path: 'beneficiaries',
        loadComponent: () =>
          import('./pages/cliente/beneficiaries/beneficiaries.page').then(
            (m) => m.BeneficiariesPage
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./pages/cliente/payments/payments.page').then(
            (m) => m.PaymentsPage
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/cliente/history/history.page').then(
            (m) => m.HistoryPage
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/cliente/profile/profile.page').then(
            (m) => m.ProfilePage
          ),
      },
    ],
  },

  // ✅ RUTA DIRECTA AL PERFIL (también funciona con /profile)
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/cliente/profile/profile.page').then(
        (m) => m.ProfilePage
      ),
  },

  // 🏠 PÁGINAS DE AYUDA
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