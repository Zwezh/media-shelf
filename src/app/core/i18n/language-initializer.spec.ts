import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StorageKey } from '@msh-core/storage/storage-key';
import { languageInitializer, SUPPORTED_LANGUAGES } from './language-initializer';

describe('languageInitializer', () => {
  beforeEach(() => localStorage.removeItem(StorageKey.Language));
  afterEach(() => localStorage.removeItem(StorageKey.Language));

  it.each([
    ['pl-PL', 'pl'],
    ['de-DE', 'en'],
    [undefined, 'en'],
  ])('selects a supported language for %s', async (browserLanguage, expectedLanguage) => {
    const translate = {
      addLangs: vi.fn(),
      getBrowserLang: vi.fn(() => browserLanguage),
      use: vi.fn(() => of({})),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: TranslateService, useValue: translate }],
    });

    await TestBed.runInInjectionContext(languageInitializer);

    expect(translate.addLangs).toHaveBeenCalledWith([...SUPPORTED_LANGUAGES]);
    expect(translate.use).toHaveBeenCalledWith(expectedLanguage);
    expect(document.documentElement.lang).toBe(expectedLanguage);
    expect(localStorage.getItem(StorageKey.Language)).toBe(expectedLanguage);
  });

  it('prefers a supported persisted language over the browser language', async () => {
    localStorage.setItem(StorageKey.Language, 'ru');
    const translate = {
      addLangs: vi.fn(),
      getBrowserLang: vi.fn(() => 'pl-PL'),
      use: vi.fn(() => of({})),
    };
    TestBed.configureTestingModule({ providers: [{ provide: TranslateService, useValue: translate }] });

    await TestBed.runInInjectionContext(languageInitializer);

    expect(translate.use).toHaveBeenCalledWith('ru');
    expect(document.documentElement.lang).toBe('ru');
  });
});
