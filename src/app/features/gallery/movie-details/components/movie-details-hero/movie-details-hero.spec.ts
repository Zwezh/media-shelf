import { TestBed } from '@angular/core/testing';
import { AuthSession } from '@msh-core/auth/auth-session';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { type MovieDetails } from '../../../models/movie-details';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { MovieDetailsHero } from './movie-details-hero';

const movie: MovieDetails = {
  actors: [],
  addedDate: new Date('2025-01-01T00:00:00Z'),
  ageRating: '12+',
  backdropUrl: '/backdrop.jpg',
  countries: [],
  description: 'A test synopsis.',
  directors: [],
  durationMinutes: 169,
  extension: 'mkv',
  genres: ['Science fiction', 'Drama'],
  id: 'interstellar',
  kpId: 258687,
  originalTitle: 'Interstellar',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8.7,
  sequelsAndPrequels: [],
  similarMovies: [],
  title: 'Интерстеллар',
  type: 'movie',
  year: '2014',
};

describe('MovieDetailsHero', () => {
  beforeEach(resetTestAuthStorage);

  it('renders enabled edit/delete actions and disabled auxiliary actions without IMDb content', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    const fixture = TestBed.createComponent(MovieDetailsHero);
    fixture.componentRef.setInput('movie', movie);

    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const rating = element.querySelector<HTMLAnchorElement>('.movie-hero__rating');
    expect(rating?.href).toBe('https://www.kinopoisk.ru/film/258687');
    expect(rating?.target).toBe('_blank');
    expect(rating?.rel).toContain('noopener');
    expect(rating?.rel).toContain('noreferrer');
    expect(rating?.getAttribute('aria-label')).toContain('new tab');
    expect(element.textContent).not.toContain('IMDb');

    const buttons = [...element.querySelectorAll<HTMLButtonElement>('button')];
    expect(buttons.filter((button) => button.disabled)).toHaveLength(2);
    expect(buttons.filter((button) => !button.disabled)).toHaveLength(2);
    expect(element.textContent).toContain('Play trailer');
    expect(element.textContent).toContain('Path');
  });

  it('disables edit and delete while signed out', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(MovieDetailsHero);
    fixture.componentRef.setInput('movie', movie);
    await fixture.whenStable();

    const buttons = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')];
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });
});
