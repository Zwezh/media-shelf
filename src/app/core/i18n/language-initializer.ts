import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'pl'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (language: string | undefined): language is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);

export const languageInitializer = (): Promise<unknown> => {
  const translate = inject(TranslateService);
  const document = inject(DOCUMENT);
  const browserLanguage = translate.getBrowserLang()?.split('-')[0];
  const language = isSupportedLanguage(browserLanguage) ? browserLanguage : 'en';

  translate.addLangs([...SUPPORTED_LANGUAGES]);
  document.documentElement.lang = language;

  return firstValueFrom(translate.use(language));
};
