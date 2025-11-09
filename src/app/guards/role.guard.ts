
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
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    if (requiredRoles && requiredRoles.includes(userRole)) {
      return true;
    }

    // No tiene permiso, redirigir a su dashboard
    this.redirectToDefaultRoute(userRole);
    return false;
  }

  private redirectToDefaultRoute(role: string): void {
    switch (role) {
      case 'Administrador':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Gestor':
        this.router.navigate(['/gestor/dashboard']);
        break;
      case 'Cliente':
        this.router.navigate(['/tabs/home']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}