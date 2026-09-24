import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { GalleryApi } from '../../data-access/gallery-api';
import { type Media } from '../../models/media';
import { type MoviesPage } from '../../models/movies-page';
import { type MoviesParams } from '../../models/movies-params';
import { ToastStore } from '@msh-shared/services/toast-store';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { MoviesStore } from './movies.store';

const media: Media = {
  ageRating: '12+',
  director: 'Director',
  durationMinutes: 127,
  genres: ['Drama'],
  id: 'movie-1',
  originalTitle: 'Original title',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8.4,
  title: 'Movie title',
  type: 'movie',
  year: '2024',
};

describe('MoviesStore', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('loads a server page from URL params and navigates when pagination changes', () => {
    const initialParamMap = convertToParamMap({
      currentPage: '2',
      direction: 'asc',
      directors: ['Director One', 'Director Two'],
      genres: ['Drama', 'Comedy'],
      key: 'rating',
      pageSize: '12',
      search: 'Movie',
    });
    const queryParamMap = new BehaviorSubject(initialParamMap);
    const navigate = vi.fn(() => Promise.resolve(true));
    const getMovies = vi.fn((params: MoviesParams) => of({ currentPage: params.currentPage, media: [media], totalCount: 50 }));

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovies } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMap.asObservable(), snapshot: { queryParamMap: initialParamMap } },
        },
        { provide: Router, useValue: { navigate } },
      ],
    });

    const store = TestBed.inject(MoviesStore);

    expect(getMovies).toHaveBeenCalledWith({
      currentPage: 2,
      direction: 'asc',
      directors: ['Director One', 'Director Two'],
      genres: ['Drama', 'Comedy'],
      key: 'rating',
      pageSize: 12,
      search: 'Movie',
    });
    expect(store.page()).toBe(3);
    expect(store.pageSize()).toBe(12);
    expect(store.totalCount()).toBe(50);
    expect(store.visibleMedia()).toEqual([media]);

    store.changePage(4);

    expect(navigate).toHaveBeenLastCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: {
        currentPage: 3,
        direction: 'asc',
        directors: ['Director One', 'Director Two'],
        genres: ['Drama', 'Comedy'],
        key: 'rating',
        pageSize: 12,
        search: 'Movie',
      },
    });

    queryParamMap.next(
      convertToParamMap({
        currentPage: '3',
        direction: 'asc',
        directors: ['Director One', 'Director Two'],
        genres: ['Drama', 'Comedy'],
        key: 'rating',
        pageSize: '12',
        search: 'Movie',
      }),
    );

    expect(getMovies).toHaveBeenLastCalledWith(expect.objectContaining({ currentPage: 3 }));
    expect(store.page()).toBe(4);
  });

  it('uses canonical defaults when URL params are missing or invalid', () => {
    const initialParamMap = convertToParamMap({ currentPage: '-1', direction: 'down', key: 'unknown', pageSize: 'none' });
    const getMovies = vi.fn(() => of({ currentPage: 0, media: [], totalCount: 0 }));
    const navigate = vi.fn(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovies } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(initialParamMap), snapshot: { queryParamMap: initialParamMap } },
        },
        { provide: Router, useValue: { navigate } },
      ],
    });

    TestBed.inject(MoviesStore);

    expect(getMovies).toHaveBeenCalledWith({ currentPage: 0, direction: 'desc', key: 'addedDate', pageSize: 30 });
    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { currentPage: 0, direction: 'desc', key: 'addedDate', pageSize: 30 },
      replaceUrl: true,
    });
  });

  it('replaces an out-of-range URL page with the last available page', () => {
    const initialParamMap = convertToParamMap({ currentPage: '100', direction: 'desc', key: 'addedDate', pageSize: '30' });
    const queryParamMap = new BehaviorSubject(initialParamMap);
    const pageResponse = new Subject<MoviesPage>();
    const getMovies = vi.fn(() => pageResponse.asObservable());
    const navigate = vi.fn(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovies } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMap.asObservable(), snapshot: { queryParamMap: initialParamMap } },
        },
        { provide: Router, useValue: { navigate } },
      ],
    });

    const store = TestBed.inject(MoviesStore);
    pageResponse.next({ currentPage: 100, media: [], totalCount: 2070 });

    expect(navigate).toHaveBeenLastCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { currentPage: 68, direction: 'desc', key: 'addedDate', pageSize: 30 },
      replaceUrl: true,
    });
    expect(store.isLoading()).toBe(true);

    queryParamMap.next(convertToParamMap({ currentPage: '68', direction: 'desc', key: 'addedDate', pageSize: '30' }));
    expect(getMovies).toHaveBeenLastCalledWith({ currentPage: 68, direction: 'desc', key: 'addedDate', pageSize: 30 });
    expect(store.page()).toBe(69);
  });

  it('exposes a recoverable error state when loading fails', () => {
    const initialParamMap = convertToParamMap({});

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        ...provideI18nTesting(),
        {
          provide: GalleryApi,
          useValue: { getMovies: vi.fn(() => throwError(() => new Error('Failed'))) },
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(initialParamMap), snapshot: { queryParamMap: initialParamMap } },
        },
        { provide: Router, useValue: { navigate: vi.fn(() => Promise.resolve(true)) } },
      ],
    });

    const store = TestBed.inject(MoviesStore);
    const toastStore = TestBed.inject(ToastStore);

    expect(store.isLoading()).toBe(false);
    expect(store.hasError()).toBe(true);
    expect(store.media()).toEqual([]);
    expect(store.totalCount()).toBe(0);
    expect(toastStore.toasts()).toEqual([
      expect.objectContaining({ title: 'Library refresh failed', type: 'error', autoHide: true, delay: 5_000 }),
    ]);
  });

  it('shows a success toast after a background poll completes', () => {
    const initialParamMap = convertToParamMap({});
    const getMovies = vi
      .fn()
      .mockReturnValueOnce(of({ currentPage: 0, media: [media], totalCount: 1 }))
      .mockReturnValueOnce(of({ currentPage: 0, media: [media], totalCount: 1 }));

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovies } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(initialParamMap), snapshot: { queryParamMap: initialParamMap } },
        },
        { provide: Router, useValue: { navigate: vi.fn(() => Promise.resolve(true)) } },
      ],
    });

    TestBed.inject(MoviesStore);
    const toastStore = TestBed.inject(ToastStore);

    expect(toastStore.toasts()).toEqual([
      expect.objectContaining({ title: 'Library refreshed', type: 'success', autoHide: true, delay: 2_500 }),
    ]);
    vi.advanceTimersByTime(30_000);

    expect(getMovies).toHaveBeenCalledTimes(2);
    expect(toastStore.toasts()).toEqual([
      expect.objectContaining({ title: 'Library refreshed', type: 'success', autoHide: true, delay: 2_500 }),
    ]);
  });

  it('preserves loaded movies and shows an error toast when polling fails', () => {
    const initialParamMap = convertToParamMap({});
    const getMovies = vi
      .fn()
      .mockReturnValueOnce(of({ currentPage: 0, media: [media], totalCount: 1 }))
      .mockReturnValueOnce(throwError(() => new Error('Polling failed')));

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovies } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(initialParamMap), snapshot: { queryParamMap: initialParamMap } },
        },
        { provide: Router, useValue: { navigate: vi.fn(() => Promise.resolve(true)) } },
      ],
    });

    const store = TestBed.inject(MoviesStore);
    const toastStore = TestBed.inject(ToastStore);

    vi.advanceTimersByTime(30_000);

    expect(store.media()).toEqual([media]);
    expect(store.totalCount()).toBe(1);
    expect(store.hasError()).toBe(false);
    expect(toastStore.toasts()).toEqual([
      expect.objectContaining({ title: 'Library refresh failed', type: 'error', autoHide: true, delay: 5_000 }),
    ]);
  });
});
