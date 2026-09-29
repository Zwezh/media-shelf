import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { type MovieAutofill } from '../models/movie-autofill.model';
import { KinopoiskApi } from './kinopoisk-api';

describe('KinopoiskApi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KinopoiskApi,
        provideEnvironment({ apiUrl: '/api', kinopoiskToken: 'test-token', production: false }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  it('loads and maps the complete PoiskKino movie response with one request', () => {
    const api = TestBed.inject(KinopoiskApi);
    const http = TestBed.inject(HttpTestingController);
    let result: MovieAutofill | undefined;

    api.getMovieAutofill(301).subscribe((movie) => {
      result = movie;
    });

    const request = http.expectOne('https://api.poiskkino.dev/v1.4/movie/301');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('X-API-KEY')).toBe('test-token');
    request.flush({
      ageRating: 16,
      backdrop: { url: '/backdrop.jpg' },
      countries: [{ name: 'США' }],
      description: 'Описание',
      genres: [{ name: 'фантастика' }],
      id: 301,
      movieLength: 136,
      name: 'Матрица',
      persons: [{ enProfession: 'director', name: 'Лана Вачовски' }],
      poster: { previewUrl: '/poster-preview.jpg', url: '/poster.jpg' },
      rating: { kp: 8.5 },
      sequelsAndPrequels: [{ name: 'Матрица: Перезагрузка' }],
      similarMovies: [{ name: 'Тёмный город' }],
      year: 1999,
    });

    expect(result).toMatchObject({
      ageRating: 16,
      backdropUrl: '/backdrop.jpg',
      countries: ['США'],
      directors: ['Лана Вачовски'],
      genres: ['фантастика'],
      kpId: 301,
      name: 'Матрица',
      posterUrl: '/poster.jpg',
      rating: 8.5,
      sequelsAndPrequels: ['Матрица: Перезагрузка'],
      similarMovies: ['Тёмный город'],
      year: 1999,
    });
    http.verify();
  });

  it('rejects a malformed required movie response', () => {
    const api = TestBed.inject(KinopoiskApi);
    const http = TestBed.inject(HttpTestingController);
    const error = vi.fn();

    api.getMovieAutofill(301).subscribe({ error });
    http.expectOne('https://api.poiskkino.dev/v1.4/movie/301').flush({ name: 'Missing ID' });

    expect(error).toHaveBeenCalledWith(expect.any(TypeError));
    http.verify();
  });
});
