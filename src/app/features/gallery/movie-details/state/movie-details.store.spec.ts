import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { TOAST_AUTO_HIDE_DELAY_MS } from '@msh-shared/config/toast';
import { ToastStore } from '@msh-shared/services/toast-store';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { GalleryApi } from '../../data-access/gallery-api';
import { type MovieDetails } from '../../models/movie-details';
import { MovieDetailsStore } from './movie-details.store';

const movie = (id: string): MovieDetails => ({
  actors: ['Actor'],
  addedDate: new Date('2025-01-01T00:00:00Z'),
  ageRating: '12+',
  backdropUrl: '/backdrop.jpg',
  countries: ['United States'],
  description: 'Description',
  directors: ['Director'],
  durationMinutes: 120,
  extension: 'mkv',
  genres: ['Drama'],
  id,
  kpId: 1,
  originalTitle: `Original ${id}`,
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8,
  sequelsAndPrequels: [],
  similarMovies: [],
  title: `Movie ${id}`,
  type: 'movie',
  year: '2025',
});

describe('MovieDetailsStore', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('loads route IDs, ignores duplicates, and cancels stale requests', () => {
    const paramMap = new BehaviorSubject(convertToParamMap({ id: 'one' }));
    const responses = new Map([
      ['one', new Subject<MovieDetails>()],
      ['two', new Subject<MovieDetails>()],
    ]);
    const getMovie = vi.fn((id: string) => responses.get(id)?.asObservable() ?? of(movie(id)));

    TestBed.configureTestingModule({
      providers: [
        MovieDetailsStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovie } },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap.asObservable() } },
      ],
    });

    const store = TestBed.inject(MovieDetailsStore);
    expect(store.isLoading()).toBe(true);
    expect(getMovie).toHaveBeenCalledWith('one');

    paramMap.next(convertToParamMap({ id: 'one' }));
    expect(getMovie).toHaveBeenCalledTimes(1);

    paramMap.next(convertToParamMap({ id: 'two' }));
    responses.get('one')?.next(movie('one'));
    expect(store.movie()).toBeNull();

    responses.get('two')?.next(movie('two'));
    expect(store.movie()?.id).toBe('two');
    expect(store.isLoading()).toBe(false);
    expect(TestBed.inject(ToastStore).toasts()).toEqual([
      expect.objectContaining({ delay: TOAST_AUTO_HIDE_DELAY_MS.success, title: 'Movie loaded', type: 'success' }),
    ]);
  });

  it('exposes an error state and retries the last requested ID', () => {
    const getMovie = vi
      .fn<(id: string) => ReturnType<GalleryApi['getMovie']>>()
      .mockReturnValueOnce(throwError(() => new Error('Failed')))
      .mockReturnValueOnce(of(movie('one')));

    TestBed.configureTestingModule({
      providers: [
        MovieDetailsStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovie } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'one' })) } },
      ],
    });

    const store = TestBed.inject(MovieDetailsStore);
    expect(store.hasError()).toBe(true);
    expect(store.movie()).toBeNull();
    expect(TestBed.inject(ToastStore).toasts()[0]).toEqual(
      expect.objectContaining({ delay: TOAST_AUTO_HIDE_DELAY_MS.error, title: 'Movie load failed', type: 'error' }),
    );

    store.retry();

    expect(getMovie).toHaveBeenLastCalledWith('one');
    expect(getMovie).toHaveBeenCalledTimes(2);
    expect(store.hasError()).toBe(false);
    expect(store.movie()?.id).toBe('one');
  });

  it('deletes a movie once, shows success feedback, and returns to the preserved library URL', () => {
    const deleteMovie = vi.fn(() => of(undefined));
    const navigate = vi.fn(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        MovieDetailsStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { deleteMovie, getMovie: () => of(movie('one')) } },
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'one' })) } },
      ],
    });

    const store = TestBed.inject(MovieDetailsStore);
    store.deleteMovie('one');

    expect(deleteMovie).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/gallery/movies'], { queryParamsHandling: 'preserve' });
    expect(TestBed.inject(ToastStore).toasts().at(-1)).toEqual(expect.objectContaining({ title: 'Movie deleted', type: 'success' }));
  });
});
