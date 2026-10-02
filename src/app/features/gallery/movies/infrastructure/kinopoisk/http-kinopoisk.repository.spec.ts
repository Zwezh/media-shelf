import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthSession } from '@msh-core/auth/auth-session';
import { authenticationInterceptor } from '@msh-core/auth/authentication-interceptor';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { type MovieAutofill } from '../../../movie-editor/models/movie-autofill.model';
import { HttpKinopoiskRepository } from './http-kinopoisk.repository';

const autofill: MovieAutofill = {
  actors: ['Keanu Reeves'],
  ageRating: 16,
  backdropUrl: 'https://images.example/backdrop.jpg',
  compactPosterUrl: 'https://images.example/preview.jpg',
  countries: ['США'],
  description: 'Описание',
  directors: ['Лана Вачовски'],
  enName: 'The Matrix',
  genres: ['фантастика'],
  kpId: 301,
  movieLength: 136,
  name: 'Матрица',
  posterUrl: 'https://images.example/poster.jpg',
  rating: 8.5,
  sequelsAndPrequels: ['Матрица: Перезагрузка'],
  similarMovies: ['Тёмный город'],
  year: 1999,
};

describe('HttpKinopoiskRepository', () => {
  beforeEach(() => {
    resetTestAuthStorage();
    TestBed.configureTestingModule({
      providers: [
        provideEnvironment({ apiUrl: '/api/', production: false }),
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('loads normalized metadata from the backend using the user JWT and no provider key', () => {
    let result: MovieAutofill | undefined;
    TestBed.inject(HttpKinopoiskRepository)
      .getMovieAutofill(301)
      .subscribe((movie) => (result = movie));
    const request = TestBed.inject(HttpTestingController).expectOne('/api/kinopoisk/movies/301/autofill');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${TEST_ACCESS_TOKEN}`);
    expect(request.request.headers.has('X-API-KEY')).toBe(false);
    request.flush(autofill);
    expect(result).toEqual(autofill);
  });

  it('accepts absent optional numbers and empty metadata for draft preservation', () => {
    const empty = { ...autofill, actors: [], name: '', ageRating: undefined, rating: undefined, year: undefined, movieLength: undefined };
    let result: MovieAutofill | undefined;
    TestBed.inject(HttpKinopoiskRepository)
      .getMovieAutofill(301)
      .subscribe((movie) => (result = movie));
    TestBed.inject(HttpTestingController).expectOne('/api/kinopoisk/movies/301/autofill').flush(empty);
    expect(result).toEqual(empty);
  });

  it.each([
    { ...autofill, kpId: undefined },
    { ...autofill, kpId: 0 },
    { ...autofill, directors: [{}] },
    { ...autofill, rating: 11 },
    { ...autofill, year: 1999.5 },
    { ...autofill, ageRating: null },
    { id: 301, persons: [] },
  ])('rejects malformed normalized metadata', (body) => {
    const error = vi.fn();
    TestBed.inject(HttpKinopoiskRepository).getMovieAutofill(301).subscribe({ error });
    TestBed.inject(HttpTestingController).expectOne('/api/kinopoisk/movies/301/autofill').flush(body);
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'unexpected' }));
  });

  it.each([
    [404, 'not-found'],
    [502, 'unexpected'],
    [504, 'unexpected'],
  ] as const)('normalizes backend %s failures without signing out', (status, kind) => {
    const error = vi.fn();
    TestBed.inject(HttpKinopoiskRepository).getMovieAutofill(301).subscribe({ error });
    TestBed.inject(HttpTestingController).expectOne('/api/kinopoisk/movies/301/autofill').flush({}, { status, statusText: 'Failure' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind }));
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(true);
  });

  it('clears the user session only when the backend rejects its JWT', () => {
    const error = vi.fn();
    TestBed.inject(HttpKinopoiskRepository).getMovieAutofill(301).subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/kinopoisk/movies/301/autofill')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'unauthorized' }));
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
  });
});
