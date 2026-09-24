import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { GalleryApi } from './features/gallery/data-access/gallery-api';
import { APP_NAVIGATION_ITEMS, routes } from './app.routes';
import { provideI18nTesting } from './testing/i18n-testing';

describe('root routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter(routes),
        provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovies: () => of({ currentPage: 0, media: [], totalCount: 0 }) } },
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
    ['/gallery/wishlist', 'Wishlist'],
    ['/statistics', 'Statistics'],
    ['/settings', 'Settings'],
  ])('lazy-loads %s', async (path, heading) => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(path);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(heading);
  });

  it.each(['/', '/wishlist', '/missing'])('redirects %s to the gallery', async (path) => {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    await harness.navigateByUrl(path);

    await vi.waitFor(() => {
      expect(router.url).toBe('/gallery/movies?currentPage=0&direction=desc&key=addedDate&pageSize=30');
    });
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Movies');
  });
});
