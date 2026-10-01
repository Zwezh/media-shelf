import { DOCUMENT } from '@angular/common';
import { inject, Service, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { BrowserStorage } from '@msh-core/storage/browser-storage';
import { StorageKey } from '@msh-core/storage/storage-key';

export const SUPPORTED_LANGUAGES = ['en', 'pl', 'ru'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const isSupportedLanguage = (language: string | undefined): language is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);

@Service()
export class Language {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(BrowserStorage);
  private readonly translate = inject(TranslateService);
  private readonly selectedLanguage = signal<SupportedLanguage>('en');

  readonly language = this.selectedLanguage.asReadonly();
  readonly supportedLanguages = SUPPORTED_LANGUAGES;

  initialize(): Promise<unknown> {
    const browserLanguage = this.translate.getBrowserLang()?.split('-')[0];
    const storedLanguage = this.storage.get(StorageKey.Language);
    const language = isSupportedLanguage(storedLanguage) ? storedLanguage : isSupportedLanguage(browserLanguage) ? browserLanguage : 'en';

    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    return this.select(language);
  }

  select(language: SupportedLanguage): Promise<unknown> {
    this.selectedLanguage.set(language);
    this.document.documentElement.lang = language;
    this.storage.set(StorageKey.Language, language);

    return firstValueFrom(this.translate.use(language));
  }
}
