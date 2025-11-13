import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonTab } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, homeOutline,cash, cashOutline, card, cardOutline, settings, settingsOutline, wallet, walletOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTab, IonTabs, IonTabBar, IonTabButton, IonIcon],
  standalone: true
})
export class TabsPage implements OnInit {

  @ViewChild('tabs', {static: false}) tabs!: IonTabs;
  selectedTab: any;

  constructor() {
    // Registrar los iconos que vas a usar
    addIcons({ 
      home, 
      homeOutline, 
      cash,
      cashOutline,
      card, 
      cardOutline, 
      settings, 
      settingsOutline,
      wallet,
      walletOutline
    });
  }

  ngOnInit() {
  }

  setCurrentTab() {
    this.selectedTab = this.tabs?.getSelected();
    console.log(this.selectedTab);
  }

}
