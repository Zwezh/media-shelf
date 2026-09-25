import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { type MovieDetails } from '../../../models/movie-details';
import { RelatedMovieLists } from './related-movie-lists';

const movie = {
  actors: [],
  addedDate: null,
  ageRating: '--',
  backdropUrl: '',
  countries: [],
  description: '',
  directors: [],
  durationMinutes: 0,
  extension: 'mkv',
  genres: [],
  id: 'movie-1',
  kpId: 1,
  originalTitle: 'Movie',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8,
  sequelsAndPrequels: [],
  similarMovies: [],
  title: 'Movie',
  type: 'movie',
  year: '2025',
} satisfies MovieDetails;

describe('RelatedMovieLists', () => {
  it('omits empty blocks and renders every available item', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(RelatedMovieLists);
    fixture.componentRef.setInput('movie', movie);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('section')).toBeNull();

    fixture.componentRef.setInput('movie', {
      ...movie,
      similarMovies: ['Arrival', 'Contact'],
    });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('section')).toHaveLength(1);
    expect(Array.from(element.querySelectorAll('li'), (item) => item.textContent?.trim())).toEqual(['Arrival', 'Contact']);
    expect(element.textContent).not.toContain('Sequels & prequels');
  });
});
