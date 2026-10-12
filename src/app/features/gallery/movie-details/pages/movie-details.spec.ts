import { signal } from '@angular/core';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuthSessionTesting } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { IconRegistry } from '@msh-shared/components/icon/icon-registry';
import type { MovieDetails } from '../../models/movie-details';
import { MovieDetailsStore } from '../state/movie-details.store';
import { MovieDetailsPage } from './movie-details';

const movie: MovieDetails = {
  id: 'test',
  title: 'Test movie',
  originalTitle: 'Test movie',
  type: 'movie',
  year: '2025',
  actors: ['Actor'],
  directors: ['Director'],
  countries: ['Poland'],
  genres: ['Drama'],
  addedDate: new Date('2025-01-01T00:00:00Z'),
  ageRating: '12+',
  backdropUrl: '',
  description: 'Synopsis',
  durationMinutes: 120,
  extension: 'mkv',
  kpId: 1,
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8,
  similarMovies: ['Related title'],
  sequelsAndPrequels: [],
};

describe('Movie details deferred sections', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MovieDetailsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideRouter([]),
        provideAuthSessionTesting(),
        ...provideI18nTesting(),
        { provide: IconRegistry, useValue: { getIcon: vi.fn(async () => document.createElementNS('http://www.w3.org/2000/svg', 'svg')) } },
      ],
    }).overrideComponent(MovieDetailsPage, {
      set: {
        providers: [
          {
            provide: MovieDetailsStore,
            useValue: {
              movie: signal(movie),
              isLoading: signal(false),
              hasError: signal(false),
              isDeleting: signal(false),
            },
          },
        ],
      },
    });
    await TestBed.compileComponents();
  });

  it('keeps the hero and actions eager while deferring lower details', async () => {
    const fixture = TestBed.createComponent(MovieDetailsPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('msh-movie-details-hero')).not.toBeNull();
    expect(element.querySelector('msh-production-and-cast')).toBeNull();
    const [block] = await fixture.getDeferBlocks();
    await block.render(DeferBlockState.Complete);
    await fixture.whenStable();
    expect(element.querySelector('msh-production-and-cast')?.textContent).toContain('Actor');
    expect(element.querySelector('msh-additional-information')).not.toBeNull();
    expect(element.querySelector('msh-related-movie-lists')?.textContent).toContain('Related title');
  });

  it('provides an error message when the lower section cannot load', async () => {
    const fixture = TestBed.createComponent(MovieDetailsPage);
    await fixture.whenStable();
    const [block] = await fixture.getDeferBlocks();
    await block.render(DeferBlockState.Error);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent).toContain('Reload the page');
  });
});
