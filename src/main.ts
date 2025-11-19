import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { register } from 'swiper/element/bundle';

import { AppModule } from './app/app.module';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';


registerLocaleData(localeEs); // ← antes del bootstrap
register();


// Registrar los elementos de Swiper
register();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
