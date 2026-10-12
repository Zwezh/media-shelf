import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@msh-core/i18n/language';
import { StorageKey } from '@msh-core/storage/storage-key';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { LanguageSelector } from './language-selector';

describe('LanguageSelector', () => {
  beforeEach(() => {
    localStorage.removeItem(StorageKey.Language);
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
  });

  afterEach(() => localStorage.removeItem(StorageKey.Language));

  it.each(['pl', 'ru'] as const)('shows the initialized browser language %s on first render', async (language) => {
    vi.spyOn(TestBed.inject(TranslateService), 'getBrowserLang').mockReturnValue(language);
    await TestBed.inject(Language).initialize();

    const fixture = TestBed.createComponent(LanguageSelector);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(document.documentElement.lang).toBe(language);
    expect(select.value).toBe(language);
    expect(select.selectedOptions[0].text).toBe(language.toUpperCase());
  });

  it('renders supported languages and applies a selection', async () => {
    const fixture = TestBed.createComponent(LanguageSelector);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(Array.from(select.options).map((option) => option.text)).toEqual(['EN', 'PL', 'RU']);

    select.value = 'pl';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(document.documentElement.lang).toBe('pl');
    expect(localStorage.getItem(StorageKey.Language)).toBe('pl');

    await TestBed.inject(Language).select('ru');
    await fixture.whenStable();
    expect(select.value).toBe('ru');

    await TestBed.inject(Language).select('en');
    await fixture.whenStable();
    expect(select.value).toBe('en');
  });

  it('shows the persisted language instead of the browser language on first render', async () => {
    localStorage.setItem(StorageKey.Language, 'ru');
    vi.spyOn(TestBed.inject(TranslateService), 'getBrowserLang').mockReturnValue('pl');
    await TestBed.inject(Language).initialize();

    const fixture = TestBed.createComponent(LanguageSelector);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });
});
