import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { authenticationInterceptor } from '@msh-core/auth/authentication-interceptor';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { provideRouter, TitleStrategy, withViewTransitions } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { languageInitializer } from '@msh-core/i18n/language-initializer';
import { TranslatedTitleStrategy } from '@msh-core/i18n/translated-title-strategy';
import { themeInitializer } from '@msh-core/theme/theme-initializer';
import { KINOPOISK_REPOSITORY } from '@msh-features/gallery/movies/application/kinopoisk.repository';
import { MOVIES_REPOSITORY } from '@msh-features/gallery/movies/application/movies.repository';
import { HttpMoviesRepository } from '@msh-features/gallery/movies/infrastructure/http-movies.repository';
import { HttpKinopoiskRepository } from '@msh-features/gallery/movies/infrastructure/kinopoisk/http-kinopoisk.repository';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideEnvironment(environment),
    provideHttpClient(withInterceptors([authenticationInterceptor])),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
      }),
    }),
    provideAppInitializer(themeInitializer),
    provideAppInitializer(languageInitializer),
    provideRouter(routes, withViewTransitions()),
    { provide: MOVIES_REPOSITORY, useExisting: HttpMoviesRepository },
    { provide: KINOPOISK_REPOSITORY, useExisting: HttpKinopoiskRepository },
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
  ],
};
