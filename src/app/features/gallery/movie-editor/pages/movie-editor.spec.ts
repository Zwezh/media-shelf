import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthSession } from '@msh-core/auth/auth-session';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { createEmptyMovieEditorModel, type MovieEditorModel } from '../models/movie-editor.model';
import { MovieEditorStore } from '../state/movie-editor.store';
import { MovieEditorPage } from './movie-editor';

describe('MovieEditorPage', () => {
  beforeEach(resetTestAuthStorage);

  it('validates editor values and passes the current draft to the store', async () => {
    const store = createStore(validModel());
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        provideRouter([]),
        {
          provide: SettingsStore,
          useValue: createSettingsStoreStub(),
        },
      ],
    });
    TestBed.overrideComponent(MovieEditorPage, { set: { providers: [{ provide: MovieEditorStore, useValue: store }] } });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    const fixture = TestBed.createComponent(MovieEditorPage);
    await fixture.whenStable();

    expect(saveButtons(fixture.nativeElement).every((button) => !button.disabled)).toBe(true);

    setInput(fixture.nativeElement, '#movie-editor-name', '   ');
    await fixture.whenStable();
    expect(saveButtons(fixture.nativeElement).every((button) => button.disabled)).toBe(true);

    submitForm(fixture.nativeElement);
    await fixture.whenStable();

    expect(store.save).not.toHaveBeenCalled();
    expect((fixture.nativeElement.ownerDocument.activeElement as HTMLElement | null)?.id).toBe('movie-editor-name');

    setInput(fixture.nativeElement, '#movie-editor-name', '  Movie title  ');
    setInput(fixture.nativeElement, '#movie-editor-year', '2020, 2021');
    setInput(fixture.nativeElement, '#movie-editor-kp-id', '123');
    setInput(fixture.nativeElement, '#movie-editor-duration', '90');
    setInput(fixture.nativeElement, '#movie-editor-rating', '8.5');
    await fixture.whenStable();
    expect(saveButtons(fixture.nativeElement).every((button) => !button.disabled)).toBe(true);

    submitForm(fixture.nativeElement);
    await fixture.whenStable();

    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ kpId: '123', name: '  Movie title  ', year: '2020, 2021' }));

    setInput(fixture.nativeElement, '#movie-editor-kp-id', '1.5');
    submitForm(fixture.nativeElement);
    await fixture.whenStable();

    expect(store.save).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement.ownerDocument.activeElement as HTMLElement | null)?.id).toBe('movie-editor-kp-id');
  });

  it('keeps Save disabled for a new incomplete movie while Section 6 remains optional', async () => {
    const store = createStore();
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        provideRouter([]),
        {
          provide: SettingsStore,
          useValue: createSettingsStoreStub(),
        },
      ],
    });
    TestBed.overrideComponent(MovieEditorPage, { set: { providers: [{ provide: MovieEditorStore, useValue: store }] } });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    const fixture = TestBed.createComponent(MovieEditorPage);
    await fixture.whenStable();

    expect(saveButtons(fixture.nativeElement).every((button) => button.disabled)).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('[required]').length).toBeGreaterThan(0);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('msh-movie-editor-relationships-universe [required]')).toHaveLength(0);
  });

  it('preselects backend defaults once settings load without reapplying them', async () => {
    const store = createStore();
    const settingsLoaded = signal(false);
    const settingsStore = createSettingsStoreStub(settingsLoaded);
    TestBed.configureTestingModule({
      providers: [...provideI18nTesting(), provideRouter([]), { provide: SettingsStore, useValue: settingsStore }],
    });
    TestBed.overrideComponent(MovieEditorPage, { set: { providers: [{ provide: MovieEditorStore, useValue: store }] } });
    const fixture = TestBed.createComponent(MovieEditorPage);
    await fixture.whenStable();

    expect(selectValue(fixture.nativeElement, '#movie-editor-quality')).toBe('');
    expect(selectValue(fixture.nativeElement, '#movie-editor-extension')).toBe('');

    settingsLoaded.set(true);
    await fixture.whenStable();
    expect(selectValue(fixture.nativeElement, '#movie-editor-quality')).toBe('1080p');
    expect(selectValue(fixture.nativeElement, '#movie-editor-extension')).toBe('MKV');

    setInput(fixture.nativeElement, '#movie-editor-quality', '2160p');
    settingsStore.defaultQuality.set('1080i');
    await fixture.whenStable();
    expect(selectValue(fixture.nativeElement, '#movie-editor-quality')).toBe('2160p');
  });

  it('fills only blank add fields when settings load', async () => {
    const store = createStore({ ...createEmptyMovieEditorModel(), quality: '2160p' });
    const settingsLoaded = signal(false);
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        provideRouter([]),
        { provide: SettingsStore, useValue: createSettingsStoreStub(settingsLoaded) },
      ],
    });
    TestBed.overrideComponent(MovieEditorPage, { set: { providers: [{ provide: MovieEditorStore, useValue: store }] } });
    const fixture = TestBed.createComponent(MovieEditorPage);
    await fixture.whenStable();

    settingsLoaded.set(true);
    await fixture.whenStable();

    expect(selectValue(fixture.nativeElement, '#movie-editor-quality')).toBe('2160p');
    expect(selectValue(fixture.nativeElement, '#movie-editor-extension')).toBe('MKV');
  });

  it('keeps saved edit values available when settings no longer contain them', async () => {
    const store = createStore({ ...validModel(), extension: ' VOLUME 1 (2007)', quality: 'Legacy Remux' }, 'edit');
    TestBed.configureTestingModule({
      providers: [...provideI18nTesting(), provideRouter([]), { provide: SettingsStore, useValue: createSettingsStoreStub() }],
    });
    TestBed.overrideComponent(MovieEditorPage, { set: { providers: [{ provide: MovieEditorStore, useValue: store }] } });
    const fixture = TestBed.createComponent(MovieEditorPage);
    await fixture.whenStable();

    expect(selectValue(fixture.nativeElement, '#movie-editor-quality')).toBe('Legacy Remux');
    expect(selectValue(fixture.nativeElement, '#movie-editor-extension')).toBe(' VOLUME 1 (2007)');
  });
});

function createStore(seed: MovieEditorModel = createEmptyMovieEditorModel(), mode: 'add' | 'edit' = 'add') {
  return {
    autofill: vi.fn(),
    breadcrumbTitle: signal(''),
    discard: vi.fn(),
    hasLoadError: signal(false),
    isAutofilling: signal(false),
    isBusy: signal(false),
    isLoading: signal(false),
    isSaving: signal(false),
    mode: signal<'add' | 'edit'>(mode),
    retry: vi.fn(),
    save: vi.fn(),
    seed: signal(seed),
  };
}

function createSettingsStoreStub(settingsLoaded = signal(true)) {
  return {
    defaultExtension: signal('MKV'),
    defaultQuality: signal('1080p'),
    extensionOptions: signal([{ value: 'MKV', default: true }, { value: 'MP4' }]),
    genresForFilters: signal(['Drama']),
    qualityOptions: signal([
      { title: '2160p 4K', value: '2160p' },
      { title: '1080p FHD', value: '1080p', default: true },
    ]),
    settings: { error: signal(undefined), hasValue: settingsLoaded, isLoading: signal(false) },
  };
}

function validModel(): MovieEditorModel {
  return {
    ...createEmptyMovieEditorModel(),
    actors: 'Actor',
    ageRating: '',
    backdropUrl: 'https://example.com/backdrop.jpg',
    countries: 'USA',
    description: 'Description',
    directors: 'Director',
    enName: 'Original title',
    extension: 'MKV',
    genres: ['Drama'],
    kpId: '123',
    movieLength: '90',
    name: 'Movie title',
    posterUrl: 'https://example.com/poster.jpg',
    quality: '1080p',
    rating: '8.5',
    year: '2020',
  };
}

function setInput(root: HTMLElement, selector: string, value: string): void {
  const input = root.querySelector<HTMLInputElement>(selector);
  if (!input) throw new Error(`Missing input: ${selector}`);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function submitForm(root: HTMLElement): void {
  root.querySelector<HTMLFormElement>('#movie-editor-form')?.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
}

function saveButtons(root: HTMLElement): HTMLButtonElement[] {
  return [...root.querySelectorAll<HTMLButtonElement>('button[type="submit"]')];
}

function selectValue(root: HTMLElement, selector: string): string | undefined {
  return root.querySelector<HTMLSelectElement>(selector)?.value;
}
