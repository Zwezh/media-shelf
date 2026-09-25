import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { type MovieDetails } from '../../../models/movie-details';
import { AdditionalInformation } from './additional-information';

const movie = {
  actors: [],
  addedDate: new Date(2025, 0, 2),
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

describe('AdditionalInformation', () => {
  it('renders only added date, quality, and extension rows', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(AdditionalInformation);
    fixture.componentRef.setInput('movie', movie);

    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('dt')).toHaveLength(3);
    expect(element.textContent).toContain('Added to Library');
    expect(element.textContent).toContain('Quality');
    expect(element.textContent).toContain('Extension');
    expect(element.textContent).not.toContain('Verified');
  });
});
