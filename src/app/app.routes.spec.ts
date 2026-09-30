import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { of } from 'rxjs';
import { type Media } from './features/gallery/models/media';
import { type MovieDetails } from './features/gallery/models/movie-details';
import { DeleteMovieUseCase } from './features/gallery/movies/application/delete-movie.use-case';
import { GetMovieDetailsQuery } from './features/gallery/movies/application/get-movie-details.query';
import { GetMoviesQuery } from './features/gallery/movies/application/get-movies.query';
import { APP_NAVIGATION_ITEMS, routes } from './app.routes';
import { provideI18nTesting } from './testing/i18n-testing';

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

const movieDetails: MovieDetails = {
  actors: ['Actor'],
  addedDate: new Date('2025-01-01T00:00:00Z'),
  ageRating: '12+',
  backdropUrl: '',
  countries: ['United States'],
  description: 'Description',
  directors: ['Director'],
  durationMinutes: 120,
  extension: 'mkv',
  genres: ['Drama'],
  id: 'movie-1',
  kpId: 1,
  originalTitle: 'Original title',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8,
  sequelsAndPrequels: [],
  similarMovies: [],
  title: 'Movie title',
  type: 'movie',
  year: '2025',
};

describe('root routes', () => {
  let getMovies: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getMovies = vi.fn(() => of({ currentPage: 0, media: [], totalCount: 0 }));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter(routes),
        provideI18nTesting(),
        { provide: DeleteMovieUseCase, useValue: { execute: vi.fn() } },
        { provide: GetMovieDetailsQuery, useValue: { execute: () => of(movieDetails) } },
        { provide: GetMoviesQuery, useValue: { execute: getMovies } },
        {
          provide: SettingsStore,
          useValue: {
            extensionOptions: signal([]),
            qualityOptions: signal([]),
            settings: {
              error: signal(undefined),
              hasValue: signal(true),
              isLoading: signal(false),
              reload: vi.fn(),
              value: signal({ extension: [], genresForFilters: [], id: 'settings-1', quality: [] }),
            },
          },
        },
      ],
    });
  });

  it('exposes ordered root navigation without redirects or gallery children', () => {
    expect(APP_NAVIGATION_ITEMS).toEqual([
      { labelKey: 'navigation.gallery', order: 1, path: '/gallery' },
      { labelKey: 'navigation.statistics', order: 2, path: '/statistics' },
      { labelKey: 'navigation.settings', order: 3, path: '/settings' },
    ]);
  });

  it.each([
    ['/gallery', 'Movies'],
    ['/gallery/movies', 'Movies'],
    ['/gallery/movies/movie-1', 'Movie title'],
    ['/gallery/wishlist', 'Wishlist'],
    ['/statistics', 'Statistics'],
    ['/settings', 'Settings'],
  ])('lazy-loads %s', async (path, heading) => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(path);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(heading);
  });

  it('navigates from a movie card to details while preserving collection query parameters', async () => {
    getMovies.mockReturnValue(of({ currentPage: 1, media: [media], totalCount: 31 }));
    const harness = await RouterTestingHarness.create('/gallery/movies?currentPage=1&direction=desc&key=addedDate&pageSize=30');
    const router = TestBed.inject(Router);
    const viewButton = harness.routeNativeElement?.querySelector<HTMLButtonElement>('.media-card__action');

    viewButton?.click();
    await harness.fixture.whenStable();

    expect(router.url).toBe('/gallery/movies/movie-1?currentPage=1&direction=desc&key=addedDate&pageSize=30');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Movie title');
  });

  it.each(['/', '/wishlist', '/missing'])('redirects %s to the gallery', async (path) => {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    await harness.navigateByUrl(path);

    await vi.waitFor(() => {
      expect(router.url).toBe('/gallery/movies');
    });
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Movies');
  });
});
