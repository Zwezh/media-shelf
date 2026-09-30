import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthSession } from '@msh-core/auth/auth-session';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import type { Media } from '../../models/media';
import { MoviesStore } from '../state/movies.store';
import { Movies } from './movies';

const media: Media = {
  ageRating: '12+',
  director: 'Director',
  durationMinutes: 120,
  genres: ['Drama'],
  id: 'movie-1',
  originalTitle: 'Original title',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8,
  title: 'Movie title',
  type: 'movie',
  year: '2025',
};

describe('Movies page', () => {
  beforeEach(resetTestAuthStorage);

  it('wires card edit and confirmed delete actions', async () => {
    const store = createStore();
    const navigate = vi.fn(() => Promise.resolve(true));
    const open = vi.fn(() => ({ closed: of(true) }));
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: FloatingPanel, useValue: { open } },
        { provide: Router, useValue: { navigate } },
      ],
    });
    TestBed.overrideComponent(Movies, { set: { providers: [{ provide: MoviesStore, useValue: store }] } });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    const fixture = TestBed.createComponent(Movies);
    await fixture.whenStable();
    const actions = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.media-card__action');

    actions[1]?.click();
    actions[2]?.click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['movie-1', 'edit'], { relativeTo: expect.anything(), queryParamsHandling: 'preserve' });
    expect(open).toHaveBeenCalled();
    expect(store.deleteMovie).toHaveBeenCalledWith('movie-1');
  });

  it('offers a retry action after a load failure', async () => {
    const store = createStore();
    store.hasError.set(true);
    store.media.set([]);
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: FloatingPanel, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
    TestBed.overrideComponent(Movies, { set: { providers: [{ provide: MoviesStore, useValue: store }] } });
    const fixture = TestBed.createComponent(Movies);
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.movies__error .btn')?.click();

    expect(store.retry).toHaveBeenCalledOnce();
  });

  it('disables Add movie and explains the sign-in requirement while signed out', async () => {
    const store = createStore();
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: FloatingPanel, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
    TestBed.overrideComponent(Movies, { set: { providers: [{ provide: MoviesStore, useValue: store }] } });
    const fixture = TestBed.createComponent(Movies);
    await fixture.whenStable();

    const addButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.movies__add-button')!;
    expect(addButton.disabled).toBe(true);
    expect(addButton.title).toBe('Sign in to add or modify library items');
  });
});

function createStore() {
  return {
    activeFilterCount: signal(0),
    appliedFilters: signal({}),
    applyFilters: vi.fn(),
    applySorting: vi.fn(),
    changePage: vi.fn(),
    deleteMovie: vi.fn(),
    deletingId: signal<string | null>(null),
    hasError: signal(false),
    isDeleting: signal(false),
    isLoading: signal(false),
    media: signal<readonly Media[]>([media]),
    page: signal(1),
    pageSize: signal(30),
    removeFilters: vi.fn(),
    retry: vi.fn(),
    sorting: signal({ direction: 'desc' as const, key: 'addedDate' as const }),
    totalCount: signal(1),
    visibleMedia: signal<readonly Media[]>([media]),
  };
}
