import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { BrowserStorage } from '@msh-core/storage/browser-storage';
import { StorageKey } from '@msh-core/storage/storage-key';

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ResolvedTheme = Exclude<ThemePreference, 'system'>;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const isThemePreference = (value: string | undefined): value is ThemePreference => THEME_PREFERENCES.includes(value as ThemePreference);

@Service()
export class Theme {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(BrowserStorage);
  private readonly browserWindow = this.document.defaultView;
  private readonly mediaQuery =
    typeof this.browserWindow?.matchMedia === 'function' ? this.browserWindow.matchMedia('(prefers-color-scheme: dark)') : undefined;
  private readonly browserTheme = signal<ResolvedTheme>(this.mediaQuery?.matches ? 'dark' : 'light');
  private readonly selectedPreference = signal<ThemePreference>(this.readStoredPreference());

  readonly preference = this.selectedPreference.asReadonly();
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const preference = this.selectedPreference();
    return preference === 'system' ? this.browserTheme() : preference;
  });
  readonly nextPreference = computed<ThemePreference>(() => {
    const index = THEME_PREFERENCES.indexOf(this.selectedPreference());
    return THEME_PREFERENCES[(index + 1) % THEME_PREFERENCES.length];
  });
  readonly checkboxState = computed(() =>
    this.selectedPreference() === 'system' ? 'mixed' : this.selectedPreference() === 'dark' ? 'true' : 'false',
  );

  constructor() {
    const onBrowserThemeChange = (event: MediaQueryListEvent): void => {
      this.browserTheme.set(event.matches ? 'dark' : 'light');
      if (this.selectedPreference() === 'system') this.applyTheme();
    };
    this.mediaQuery?.addEventListener('change', onBrowserThemeChange);
    this.destroyRef.onDestroy(() => this.mediaQuery?.removeEventListener('change', onBrowserThemeChange));
  }

  initialize(): void {
    this.applyTheme();
  }

  cycle(): void {
    this.select(this.nextPreference());
  }

  select(preference: ThemePreference): void {
    this.selectedPreference.set(preference);
    this.storage.set(StorageKey.Theme, preference);
    this.applyTheme();
  }

  private applyTheme(): void {
    this.document.documentElement.dataset['theme'] = this.resolvedTheme();
  }

  private readStoredPreference(): ThemePreference {
    const preference = this.storage.get(StorageKey.Theme);
    return isThemePreference(preference) ? preference : 'system';
  }
}
