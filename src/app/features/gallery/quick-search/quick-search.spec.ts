import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { of, throwError } from 'rxjs';
import type { GalleryItem } from '../catalog/models/gallery-item';
import { GetGalleryQuery } from '../catalog/application/get-gallery.query';
import { QuickSearch } from './quick-search';
import { QUICK_SEARCH_DEBOUNCE } from './quick-search.store';

const TEST_DEBOUNCE_MS = 10;

const media: GalleryItem = {
  ageRating: 12,
  addedDate: '2026-10-01',
  collection: 'movies',
  kind: 'movie',
  kpId: '1',
  series: null,
  qualityValues: ['2160p'],
  compactPosterUrl: '',
  directors: ['Denis Villeneuve'],
  durationMinutes: 166,
  genres: ['Science fiction'],
  id: 'dune-part-two',
  originalTitle: 'Dune: Part Two',
  posterUrl: '/dune.jpg',
  rating: 8.5,
  title: 'Dune: Part Two',
  year: 2024,
};

describe('QuickSearch', () => {
  const getGallery = vi.fn();

  beforeEach(async () => {
    getGallery.mockReturnValue(of({ currentPage: 0, media: [media], totalCount: 1 }));

    await TestBed.configureTestingModule({
      imports: [QuickSearch],
      providers: [
        provideI18nTesting(),
        provideRouter([]),
        { provide: GetGalleryQuery, useValue: { execute: getGallery } },
        { provide: QUICK_SEARCH_DEBOUNCE, useValue: TEST_DEBOUNCE_MS },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('debounces catalog requests and renders linked result rows', async () => {
    const fixture = TestBed.createComponent(QuickSearch);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.hasAttribute('aria-expanded')).toBe(false);
    input.value = 'Dune';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.quick-search__status').textContent).toContain('Searching catalog');
    expect(getGallery).not.toHaveBeenCalled();

    await waitForDebounce();
    await fixture.whenStable();

    expect(getGallery).toHaveBeenCalledWith({
      currentPage: 0,
      direction: 'desc',
      key: 'addedDate',
      pageSize: 6,
      search: 'Dune',
    });
    const result = fixture.nativeElement.querySelector('.quick-search__result') as HTMLAnchorElement;
    expect(result.textContent).toContain('Dune: Part Two');
    expect(result.getAttribute('href')).toBe('/gallery/movies/dune-part-two?search=Dune');
    expect(fixture.nativeElement.querySelector('.quick-search__hint').textContent).toContain('show all matches');
  });

  it('applies a search to the global Gallery list', async () => {
    const fixture = TestBed.createComponent(QuickSearch);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = '  Dune  ';
    input.dispatchEvent(new Event('input'));
    await waitForDebounce();
    await fixture.whenStable();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new SubmitEvent('submit', { cancelable: true }));

    expect(navigate).toHaveBeenCalledWith(['/gallery'], { queryParams: { search: 'Dune' } });
  });

  it('navigates on Enter even when preview has no matches', async () => {
    getGallery.mockReturnValue(of({ currentPage: 0, media: [], totalCount: 0 }));
    const fixture = TestBed.createComponent(QuickSearch);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'Unknown';
    input.dispatchEvent(new Event('input'));
    await waitForDebounce();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new SubmitEvent('submit', { cancelable: true }));

    expect(navigate).toHaveBeenCalledWith(['/gallery'], { queryParams: { search: 'Unknown' } });
  });

  it('shows a recoverable message when preview loading fails', async () => {
    getGallery.mockReturnValue(throwError(() => new Error('Failed')));
    const fixture = TestBed.createComponent(QuickSearch);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'Dune';
    input.dispatchEvent(new Event('input'));
    await waitForDebounce();
    await fixture.whenStable();

    const status = fixture.nativeElement.querySelector('.quick-search__status') as HTMLElement;
    expect(status.getAttribute('role')).toBe('alert');
    expect(status.textContent).toContain('Search is unavailable');
  });
});

const waitForDebounce = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, TEST_DEBOUNCE_MS + 5);
  });

describe('Gallery preview submission', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('submits a nonblank query before the debounce completes and ignores blank input', async () => {
    const execute = vi.fn();
    TestBed.configureTestingModule({
      imports: [QuickSearch],
      providers: [
        provideI18nTesting(),
        provideRouter([]),
        { provide: GetGalleryQuery, useValue: { execute } },
        { provide: QUICK_SEARCH_DEBOUNCE, useValue: 1000 },
      ],
    });
    const fixture = TestBed.createComponent(QuickSearch);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    input.value = '  ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect(navigate).not.toHaveBeenCalled();
    input.value = '  Future series  ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect(execute).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/gallery'], { queryParams: { search: 'Future series' } });
    fixture.destroy();
  });
  it('routes Series and Wishlist results to their own detail pages and preserves unknown ratings', async () => {
    const wish = { ...media, id: 'wish', collection: 'wishlist' as const, rating: null };
    const series = {
      ...media,
      id: 'series',
      collection: 'series' as const,
      kind: 'series' as const,
      series: {
        startYear: 2020,
        endYear: null,
        productionStatus: 'in_production' as const,
        availableSeasonCount: 1,
        recordedSeasonCount: 2,
      },
    };
    TestBed.configureTestingModule({
      imports: [QuickSearch],
      providers: [
        provideI18nTesting(),
        provideRouter([]),
        { provide: GetGalleryQuery, useValue: { execute: () => of({ currentPage: 0, media: [series, wish], totalCount: 2 }) } },
        { provide: QUICK_SEARCH_DEBOUNCE, useValue: 0 },
      ],
    });
    const fixture = TestBed.createComponent(QuickSearch);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Dune';
    input.dispatchEvent(new Event('input'));
    await waitForDebounce();
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('.quick-search__result') as NodeListOf<HTMLAnchorElement>;
    expect(links[0].getAttribute('href')).toBe('/gallery/series/series?search=Dune');
    expect(links[1].getAttribute('href')).toBe('/gallery/wishlist/wish?search=Dune');
    expect(links[1].querySelector('.quick-search__rating')).toBeNull();
    expect(links[1].textContent).toContain('Wishlist');
  });
});
