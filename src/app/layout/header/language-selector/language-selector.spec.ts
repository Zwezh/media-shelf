import { TestBed } from '@angular/core/testing';
import { StorageKey } from '@msh-core/storage/storage-key';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { LanguageSelector } from './language-selector';

describe('LanguageSelector', () => {
  beforeEach(() => {
    localStorage.removeItem(StorageKey.Language);
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
  });

  afterEach(() => localStorage.removeItem(StorageKey.Language));

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
  });
});
