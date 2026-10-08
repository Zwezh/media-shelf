import { computed, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthSession } from '@msh-core/auth/auth-session';
import type { SettingsDto } from '@msh-core/settings/settings.dto';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { ToastStore } from '@msh-shared/services/toast-store';
import { provideAuthSessionTesting, resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { of } from 'rxjs';
import { Settings } from './settings';

const INITIAL_SETTINGS: SettingsDto = {
  extension: [{ value: 'MP4' }, { value: 'MKV', default: true }],
  genresForFilters: ['Drama', 'Action'],
  id: 'settings-1',
  quality: [
    { title: '2160p 4K', value: '2160p' },
    { title: '1080p FHD', value: '1080p', default: true },
  ],
};

describe('Settings', () => {
  beforeEach(resetTestAuthStorage);

  it('shows API defaults but disables every editing control for an unauthenticated user', async () => {
    const store = createSettingsStoreStub();
    TestBed.configureTestingModule({
      providers: [provideAuthSessionTesting(), ...provideI18nTesting(), { provide: SettingsStore, useValue: store }],
    });
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(TestBed.inject(ToastStore).toasts()).toEqual([expect.objectContaining({ title: 'settings.loadSuccessTitle', type: 'success' })]);
    expect(selectValue(root, '#settings-quality')).toBe('1080p');
    expect(selectValue(root, '#settings-extension')).toBe('MKV');
    expect(root.textContent).toContain('Sign in to change defaults');
    expect([...root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')].every((control) => control.disabled)).toBe(
      true,
    );
    expect(
      [...root.querySelectorAll<HTMLButtonElement>('button')].every(
        (button) => button.disabled || button.textContent?.includes('Try again'),
      ),
    ).toBe(true);
  });

  it('adds, removes, refills, discards, and saves authenticated settings', async () => {
    const store = createSettingsStoreStub();
    TestBed.configureTestingModule({
      providers: [provideAuthSessionTesting(), ...provideI18nTesting(), { provide: SettingsStore, useValue: store }],
    });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    setInput(root, '#settings-new-genre', 'Comedy');
    await fixture.whenStable();
    clickButton(root, 'Add genre');
    await fixture.whenStable();
    expect(root.textContent).toContain('Comedy');

    clickButton(root, 'Refill from movies');
    await fixture.whenStable();
    expect(store.refillGenres).toHaveBeenCalledOnce();
    expect(root.textContent).toContain('Mystery');
    expect(root.textContent).not.toContain('Comedy');

    clickButton(root, 'Discard changes');
    await fixture.whenStable();
    expect(root.textContent).toContain('Action');
    expect(root.textContent).not.toContain('Mystery');

    setSelect(root, '#settings-quality', '2160p');
    root.querySelector<HTMLButtonElement>('button[aria-label="Remove Action"]')?.click();
    await fixture.whenStable();
    submitForm(root);
    await fixture.whenStable();

    expect(store.update).toHaveBeenCalledWith({
      extension: [
        { value: 'MP4', default: false },
        { value: 'MKV', default: true },
      ],
      genresForFilters: ['Drama'],
      id: 'settings-1',
      quality: [
        { title: '2160p 4K', value: '2160p', default: true },
        { title: '1080p FHD', value: '1080p', default: false },
      ],
    });
  });

  it('shows error feedback when settings loading fails', async () => {
    const loading = signal(true);
    const error = signal<unknown>(undefined);
    const store = createSettingsStoreStub({ error, loading });
    TestBed.configureTestingModule({
      providers: [provideAuthSessionTesting(), ...provideI18nTesting(), { provide: SettingsStore, useValue: store }],
    });
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    expect(TestBed.inject(ToastStore).toasts()).toEqual([]);

    error.set(new Error('Failed'));
    loading.set(false);
    await fixture.whenStable();

    expect(TestBed.inject(ToastStore).toasts()).toEqual([expect.objectContaining({ title: 'settings.loadErrorTitle', type: 'error' })]);
  });
});

function createSettingsStoreStub(options: { readonly error?: WritableSignal<unknown>; readonly loading?: WritableSignal<boolean> } = {}) {
  const value = signal(INITIAL_SETTINGS);
  const error = options.error ?? signal<unknown>(undefined);
  const loading = options.loading ?? signal(false);
  return {
    extensionOptions: computed(() => value().extension),
    qualityOptions: computed(() => value().quality),
    refillGenres: vi.fn(() => of(['Mystery', 'Thriller'])),
    settings: {
      error,
      hasValue: computed(() => !loading() && !error()),
      isLoading: loading,
      reload: vi.fn(),
      value,
    },
    update: vi.fn((draft: SettingsDto) => of(draft)),
  };
}

function clickButton(root: HTMLElement, text: string): void {
  const button = [...root.querySelectorAll<HTMLButtonElement>('button')].find((candidate) => candidate.textContent?.includes(text));
  if (!button) throw new Error(`Missing button: ${text}`);
  button.click();
}

function setInput(root: HTMLElement, selector: string, value: string): void {
  const input = root.querySelector<HTMLInputElement>(selector);
  if (!input) throw new Error(`Missing input: ${selector}`);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function setSelect(root: HTMLElement, selector: string, value: string): void {
  const select = root.querySelector<HTMLSelectElement>(selector);
  if (!select) throw new Error(`Missing select: ${selector}`);
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
}

function selectValue(root: HTMLElement, selector: string): string | undefined {
  return root.querySelector<HTMLSelectElement>(selector)?.value;
}

function submitForm(root: HTMLElement): void {
  root.querySelector<HTMLFormElement>('#settings-form')?.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
}
