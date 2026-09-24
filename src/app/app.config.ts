import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { provideRouter, TitleStrategy, withViewTransitions } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { languageInitializer } from '@msh-core/i18n/language-initializer';
import { TranslatedTitleStrategy } from '@msh-core/i18n/translated-title-strategy';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideEnvironment(environment),
    provideHttpClient(),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
      }),
    }),
    provideAppInitializer(languageInitializer),
    provideRouter(routes, withViewTransitions()),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
  ],
};
