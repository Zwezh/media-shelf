import { Injectable, Provider } from '@angular/core';
import { provideTranslateLoader, provideTranslateService, TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import translations from '../../../public/i18n/en.json';

@Injectable()
class TestTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of(translations);
  }
}

export const provideI18nTesting = (): Provider[] =>
  provideTranslateService({
    fallbackLang: 'en',
    lang: 'en',
    loader: provideTranslateLoader(TestTranslateLoader),
  });
