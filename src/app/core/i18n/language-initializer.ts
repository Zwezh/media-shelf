import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { BrowserStorage } from '@msh-core/storage/browser-storage';
import { StorageKey } from '@msh-core/storage/storage-key';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'pl'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (language: string | undefined): language is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);

export const languageInitializer = (): Promise<unknown> => {
  const translate = inject(TranslateService);
  const document = inject(DOCUMENT);
  const storage = inject(BrowserStorage);
  const browserLanguage = translate.getBrowserLang()?.split('-')[0];
  const storedLanguage = storage.get(StorageKey.Language);
  const language = isSupportedLanguage(storedLanguage) ? storedLanguage : isSupportedLanguage(browserLanguage) ? browserLanguage : 'en';

  translate.addLangs([...SUPPORTED_LANGUAGES]);
  document.documentElement.lang = language;
  storage.set(StorageKey.Language, language);

  return firstValueFrom(translate.use(language));
};
