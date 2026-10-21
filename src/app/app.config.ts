import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsEc from '@angular/common/locales/es-EC';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { envelopeInterceptor } from './shared/interceptors/envelope.interceptor';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

registerLocaleData(localeEsEc);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Fundido entre páginas (en navegadores sin View Transitions simplemente no anima).
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, envelopeInterceptor])),
    provideClientHydration(withEventReplay()),
    { provide: LOCALE_ID, useValue: 'es-EC' },
  ],
};
