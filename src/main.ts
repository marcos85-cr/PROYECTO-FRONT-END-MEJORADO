import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { register } from 'swiper/element/bundle';

import { AppModule } from './app/app.module';

// Registrar los elementos de Swiper
register();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
