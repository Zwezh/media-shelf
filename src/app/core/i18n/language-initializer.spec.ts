import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { languageInitializer, SUPPORTED_LANGUAGES } from './language-initializer';

describe('languageInitializer', () => {
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
  });
});
