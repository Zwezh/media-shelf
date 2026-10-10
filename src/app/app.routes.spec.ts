import { DeleteSeriesUseCase } from './features/gallery/series/application/delete-series.use-case';
import { GetGalleryQuery } from './features/gallery/catalog/application/get-gallery.query';
import { WISHLIST_MUTATION_TEST_PROVIDERS } from '@msh/testing/wishlist-testing';
import { provideAuthSessionTesting } from '@msh/testing/auth-testing';
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
import { GetWishlistQuery } from './features/gallery/wishlist/application/get-wishlist.query';
import { GetWishlistTitleQuery } from './features/gallery/wishlist/application/get-wishlist-title.query';
import { toTitle } from './features/gallery/catalog/utils/title.converter';
import { movieTitleDto, seriesDto } from './features/gallery/catalog/testing/title.fixture';
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

const wishlistMovie = toTitle({ ...movieTitleDto, id: 'wishlist-movie', name: 'Wishlist movie' });
const wishlistSeries = toTitle({ ...seriesDto, id: 'wishlist-series', name: 'Wishlist series' });

describe('root routes', () => {
  let getWishlist: ReturnType<typeof vi.fn>;
  let getMovies: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getWishlist = vi.fn(() => of({ currentPage: 0, media: [wishlistMovie, wishlistSeries], totalCount: 2 }));
    getMovies = vi.fn(() => of({ currentPage: 0, media: [], totalCount: 0 }));
    TestBed.configureTestingModule({
      providers: [
        ...WISHLIST_MUTATION_TEST_PROVIDERS,
        provideAuthSessionTesting(),
        provideHttpClient(),
        provideRouter(routes),
        { provide: DeleteSeriesUseCase, useValue: { execute: vi.fn() } },
        { provide: GetGalleryQuery, useValue: { execute: () => of({ currentPage: 0, media: [], totalCount: 0 }) } },
        provideI18nTesting(),
        { provide: DeleteMovieUseCase, useValue: { execute: vi.fn() } },
        { provide: GetMovieDetailsQuery, useValue: { execute: () => of(movieDetails) } },
        { provide: GetMoviesQuery, useValue: { execute: getMovies } },
        { provide: GetWishlistQuery, useValue: { execute: getWishlist } },
        {
          provide: GetWishlistTitleQuery,
          useValue: { execute: (id: string) => of(id === wishlistMovie.id ? wishlistMovie : wishlistSeries) },
        },
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
    ['/gallery', 'All items'],
    ['/gallery/movies', 'Movies'],
    ['/gallery/movies/movie-1', 'Movie title'],
    ['/gallery/wishlist', 'Wishlist'],
    ['/gallery/wishlist/wishlist-movie', 'Wishlist movie'],
    ['/gallery/wishlist/wishlist-series', 'Wishlist series'],
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

  it.each([
    [0, 'wishlist-movie', 'Movie'],
    [1, 'wishlist-series', 'Series'],
  ])('opens Wishlist card %s within its own collection', async (index, id, badge) => {
    const harness = await RouterTestingHarness.create('/gallery/wishlist?search=Test&key=rating&direction=desc');
    const cards = harness.routeNativeElement?.querySelectorAll('msh-media-card');
    expect(cards?.[index].querySelector('.media-card__topline')?.textContent).toContain(badge);
    expect(harness.routeNativeElement?.querySelectorAll('.media-card__action')).toHaveLength(6);
    cards?.[index].querySelector<HTMLButtonElement>('.media-card__action')?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe(`/gallery/wishlist/${id}?search=Test&key=rating&direction=desc`);
    expect(harness.routeNativeElement?.querySelector('.movie-hero__primary-actions')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('msh-production-and-cast')).not.toBeNull();
    expect(harness.routeNativeElement?.querySelector('msh-series-seasons')).toBeNull();
  });

  it('keeps All items active with query parameters and only Movies active on movie details', async () => {
    const harness = await RouterTestingHarness.create('/gallery?search=Thing');
    expect(harness.routeNativeElement?.querySelector('nav.gallery-navigation a[aria-current="page"]')?.textContent?.trim()).toBe(
      'All items',
    );
    await harness.navigateByUrl('/gallery/movies/movie-1?search=Thing');
    const active = harness.routeNativeElement?.querySelectorAll('nav.gallery-navigation a[aria-current="page"]');
    expect(active?.length).toBe(1);
    expect(active?.[0].textContent?.trim()).toBe('Movies');
  });

  it.each(['/', '/wishlist', '/missing'])('redirects %s to the gallery', async (path) => {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    await harness.navigateByUrl(path);

    await vi.waitFor(() => {
      expect(router.url).toBe('/gallery');
    });
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('All items');
  });
});
