import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SettingsApi } from '@msh-core/settings/settings-api';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { createEmptyMovieEditorModel } from '../models/movie-editor.model';
import { MovieEditorStore } from '../state/movie-editor.store';
import { MovieEditorPage } from './movie-editor';

describe('MovieEditorPage', () => {
  it('validates normalized values and serializes a legacy year range', async () => {
    const store = createStore();
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        provideRouter([]),
        {
          provide: SettingsApi,
          useValue: {
            genresForFilters: signal(['Drama']),
            settings: { error: signal(undefined), isLoading: signal(false) },
          },
        },
      ],
    });
    TestBed.overrideComponent(MovieEditorPage, { set: { providers: [{ provide: MovieEditorStore, useValue: store }] } });
    const fixture = TestBed.createComponent(MovieEditorPage);
    await fixture.whenStable();

    setInput(fixture.nativeElement, '#movie-editor-name', '   ');
    submitForm(fixture.nativeElement);
    await fixture.whenStable();

    expect(store.save).not.toHaveBeenCalled();
    expect((fixture.nativeElement.ownerDocument.activeElement as HTMLElement | null)?.id).toBe('movie-editor-name');

    setInput(fixture.nativeElement, '#movie-editor-name', '  Movie title  ');
    setInput(fixture.nativeElement, '#movie-editor-year', '2020, 2021');
    setInput(fixture.nativeElement, '#movie-editor-kp-id', '123');
    setInput(fixture.nativeElement, '#movie-editor-duration', '90');
    setInput(fixture.nativeElement, '#movie-editor-rating', '8.5');
    submitForm(fixture.nativeElement);
    await fixture.whenStable();

    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ kpId: 123, name: 'Movie title', year: [2020, 2021] }));

    setInput(fixture.nativeElement, '#movie-editor-kp-id', '1.5');
    submitForm(fixture.nativeElement);
    await fixture.whenStable();

    expect(store.save).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement.ownerDocument.activeElement as HTMLElement | null)?.id).toBe('movie-editor-kp-id');
  });
});

function createStore() {
  return {
    autofill: vi.fn(),
    breadcrumbTitle: signal(''),
    discard: vi.fn(),
    hasLoadError: signal(false),
    isAutofilling: signal(false),
    isBusy: signal(false),
    isLoading: signal(false),
    isSaving: signal(false),
    mode: signal<'add' | 'edit'>('add'),
    retry: vi.fn(),
    save: vi.fn(),
    seed: signal(createEmptyMovieEditorModel()),
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
