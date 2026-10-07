import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { of, throwError } from 'rxjs';
import { type Media } from '../models/media';
import { GetMoviesQuery } from '../movies/application/get-movies.query';
import { QuickSearch } from './quick-search';
import { QUICK_SEARCH_DEBOUNCE } from './quick-search.store';

const TEST_DEBOUNCE_MS = 10;

const media: Media = {
  ageRating: '12+',
  director: 'Denis Villeneuve',
  durationMinutes: 166,
  genres: ['Science fiction'],
  id: 'dune-part-two',
  originalTitle: 'Dune: Part Two',
  posterUrl: '/dune.jpg',
  quality: '4K HDR',
  rating: 8.5,
  title: 'Dune: Part Two',
  type: 'movie',
  year: '2024',
};

describe('QuickSearch', () => {
  const getMovies = vi.fn();

  beforeEach(async () => {
    getMovies.mockReturnValue(of({ currentPage: 0, media: [media], totalCount: 1 }));

    await TestBed.configureTestingModule({
      imports: [QuickSearch],
      providers: [
        provideI18nTesting(),
        provideRouter([]),
        { provide: GetMoviesQuery, useValue: { execute: getMovies } },
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
    expect(getMovies).not.toHaveBeenCalled();

    await waitForDebounce();
    await fixture.whenStable();

    expect(getMovies).toHaveBeenCalledWith({
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

  it('applies a search to the global movie list only when results exist', async () => {
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

    expect(navigate).toHaveBeenCalledWith(['/gallery/movies'], { queryParams: { search: 'Dune' } });
  });

  it('shows an empty message and ignores Enter when the API has no matches', async () => {
    getMovies.mockReturnValue(of({ currentPage: 0, media: [], totalCount: 0 }));
    const fixture = TestBed.createComponent(QuickSearch);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'Unknown';
    input.dispatchEvent(new Event('input'));
    await waitForDebounce();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new SubmitEvent('submit', { cancelable: true }));

    expect(fixture.nativeElement.querySelector('.quick-search__status').textContent).toContain('No catalog matches found for “Unknown”.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows a recoverable message when preview loading fails', async () => {
    getMovies.mockReturnValue(throwError(() => new Error('Failed')));
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
