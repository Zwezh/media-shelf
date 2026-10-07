import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { type MovieDetails } from '../../../models/movie-details';
import { ProductionAndCast } from './production-and-cast';

const movie: MovieDetails = {
  actors: ['Actor One', 'Actor Two', 'Actor Three'],
  addedDate: null,
  ageRating: '--',
  backdropUrl: '',
  countries: ['United States', 'United Kingdom'],
  description: '',
  directors: ['Director One'],
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
};

describe('ProductionAndCast', () => {
  it('renders all actor names without credit links, images, or IMDb content', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(ProductionAndCast);
    fixture.componentRef.setInput('movie', movie);

    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(Array.from(element.querySelectorAll('li'), (item) => item.textContent?.trim())).toEqual(movie.actors);
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('a')).toBeNull();
    expect(element.textContent).not.toContain('IMDb');
  });
});
