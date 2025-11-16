import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SettingsPage implements OnInit {


  ngOnInit() {}
  showTokenDetails = false;

  constructor(private authService: AuthService) {}

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
      // Puedes agregar un toast aquí
      console.log('Token copiado');
    }
  }
  // Método para verificar si el token ha expirado
  isTokenExpired(): boolean {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return false;
    return Date.now() > parseInt(expiration);
  }
  // Método para obtener el tiempo restante hasta la expiración del token
  getTimeToExpiration(): string {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return 'N/A';

    const timeLeft = parseInt(expiration) - Date.now();
    if (timeLeft <= 0) return 'Expirado';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }
}
