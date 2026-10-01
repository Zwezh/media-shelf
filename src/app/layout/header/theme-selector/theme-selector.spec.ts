import { TestBed } from '@angular/core/testing';
import { StorageKey } from '@msh-core/storage/storage-key';
import { IconRegistry } from '@msh-shared/components/icon/icon-registry';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { ThemeSelector } from './theme-selector';

describe('ThemeSelector', () => {
  beforeEach(() => {
    localStorage.removeItem(StorageKey.Theme);
    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        {
          provide: IconRegistry,
          useValue: {
            getIcon: vi.fn(async () => document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
          },
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem(StorageKey.Theme);
    document.documentElement.removeAttribute('data-theme');
  });

  it('uses button styling and cycles all three theme preferences', async () => {
    const fixture = TestBed.createComponent(ThemeSelector);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.classList).toContain('btn-secondary');
    expect(button.getAttribute('aria-checked')).toBe('mixed');

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('false');

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(button.classList).toContain('theme-selector__button--dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
