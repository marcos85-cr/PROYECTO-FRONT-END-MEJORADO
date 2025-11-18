import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class SettingsPage implements OnInit {
  showTokenDetails = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  getTokenInfo(): string {
    const token = localStorage.getItem('token');
    if (!token) return 'No hay token';

    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      return JSON.stringify(payload, null, 2);
    } catch {
      return 'Token inválido';
    }
  }

  async copyToken() {
    const token = localStorage.getItem('token');
    if (token) {
      await navigator.clipboard.writeText(token);
      console.log('Token copiado');
    }
  }

  isTokenExpired(): boolean {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return false;
    return Date.now() > parseInt(expiration);
  }

  getTimeToExpiration(): string {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return 'N/A';

    const timeLeft = parseInt(expiration) - Date.now();
    if (timeLeft <= 0) return 'Expirado';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}