


import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      // Verificar roles si están especificados
      const requiredRoles = route.data['roles'] as Array<string>;
      if (requiredRoles) {
        const userRole = this.authService.getUserRole();
        if (userRole && requiredRoles.includes(userRole)) {
          return true;
        } else {
          // Redirigir según el rol
          this.redirectByRole();
          return false;
        }
      }
      return true;
    }

    // No autenticado, redirigir al login
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  private redirectByRole(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isGestor()) {
      this.router.navigate(['/gestor/dashboard']);
    } else if (this.authService.isCliente()) {
      this.router.navigate(['/tabs/home']);
    }
  }
}