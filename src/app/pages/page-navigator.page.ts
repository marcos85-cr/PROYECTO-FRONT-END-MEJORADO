import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-navigator',
  templateUrl: './page-navigator.page.html',
  styleUrls: ['./page-navigator.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PageNavigatorPage {
  showAuthInfo = false;
}