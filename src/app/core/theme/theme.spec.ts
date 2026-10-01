import { TestBed } from '@angular/core/testing';
import { StorageKey } from '@msh-core/storage/storage-key';
import { Theme } from './theme';

describe('Theme', () => {
  let browserThemeListener: ((event: MediaQueryListEvent) => void) | undefined;

  beforeEach(() => {
    localStorage.removeItem(StorageKey.Theme);
    document.documentElement.removeAttribute('data-theme');
    const mediaQuery = {
      matches: true,
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        browserThemeListener = listener;
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => mediaQuery),
    });
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(StorageKey.Theme);
    document.documentElement.removeAttribute('data-theme');
  });

  it('uses the browser theme by default and follows browser changes', () => {
    const theme = TestBed.inject(Theme);
    theme.initialize();

    expect(theme.preference()).toBe('system');
    expect(theme.resolvedTheme()).toBe('dark');
    expect(theme.checkboxState()).toBe('mixed');
    expect(document.documentElement.dataset['theme']).toBe('dark');

    browserThemeListener?.({ matches: false } as MediaQueryListEvent);

    expect(theme.resolvedTheme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('cycles through light, dark, and browser preferences and persists each choice', () => {
    const theme = TestBed.inject(Theme);
    theme.initialize();

    theme.cycle();
    expect(theme.preference()).toBe('light');
    expect(theme.checkboxState()).toBe('false');
    expect(localStorage.getItem(StorageKey.Theme)).toBe('light');

    theme.cycle();
    expect(theme.preference()).toBe('dark');
    expect(theme.checkboxState()).toBe('true');
    expect(document.documentElement.dataset['theme']).toBe('dark');

    theme.cycle();
    expect(theme.preference()).toBe('system');
    expect(theme.checkboxState()).toBe('mixed');
    expect(localStorage.getItem(StorageKey.Theme)).toBe('system');
  });

  it('restores a persisted preference', () => {
    localStorage.setItem(StorageKey.Theme, 'light');

    const theme = TestBed.inject(Theme);
    theme.initialize();

    expect(theme.preference()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });
});
