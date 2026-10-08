import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from '@msh-core/auth/auth-session';
import { authenticatedRouteInitializer } from '@msh-core/auth/authenticated-route-initializer';
import { authenticationInterceptor } from '@msh-core/auth/authentication-interceptor';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { provideRouter, TitleStrategy, withViewTransitions } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { languageInitializer } from '@msh-core/i18n/language-initializer';
import { TranslatedTitleStrategy } from '@msh-core/i18n/translated-title-strategy';
import { themeInitializer } from '@msh-core/theme/theme-initializer';
import { MOVIES_REPOSITORY } from '@msh-features/gallery/movies/application/movies.repository';
import { HttpMoviesRepository } from '@msh-features/gallery/movies/infrastructure/http-movies.repository';
import { SERIES_REPOSITORY } from '@msh-features/gallery/series/application/series.repository';
import { HttpSeriesRepository } from '@msh-features/gallery/series/infrastructure/http-series.repository';
import { WISHLIST_REPOSITORY } from '@msh-features/gallery/wishlist/application/wishlist.repository';
import { HttpWishlistRepository } from '@msh-features/gallery/wishlist/infrastructure/http-wishlist.repository';
import { TITLE_AUTOFILL_REPOSITORY } from '@msh-features/gallery/catalog/application/title-autofill.repository';
import { HttpTitleAutofillRepository } from '@msh-features/gallery/catalog/infrastructure/kinopoisk/http-title-autofill.repository';
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
    provideAppInitializer(() => firstValueFrom(inject(AuthSession).restore())),
    provideAppInitializer(authenticatedRouteInitializer),
    provideAppInitializer(themeInitializer),
    provideAppInitializer(languageInitializer),
    provideRouter(routes, withViewTransitions()),
    { provide: TITLE_AUTOFILL_REPOSITORY, useExisting: HttpTitleAutofillRepository },
    { provide: SERIES_REPOSITORY, useExisting: HttpSeriesRepository },
    { provide: WISHLIST_REPOSITORY, useExisting: HttpWishlistRepository },
    { provide: MOVIES_REPOSITORY, useExisting: HttpMoviesRepository },
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
  ],
};
