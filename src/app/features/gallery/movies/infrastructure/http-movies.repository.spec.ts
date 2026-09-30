import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { AppError } from '@msh-core/http/app-error';
import { environment } from '../../../../../environments/environment';
import { type MediaDto } from '../../models/media.dto';
import { type MoviesParams } from '../../models/movies-params';
import { toMovieEditorModel } from '../../movie-editor/utils/movie-editor.converter';
import { MoviesApiClient } from './movies-api.client';
import { HttpMoviesRepository } from './http-movies.repository';

const testEnvironment = {
  ...environment,
  apiUrl: 'http://localhost:4200/api/',
  kinopoiskToken: 'test-token',
  production: false,
};

const mediaDto: MediaDto = {
  addedDate: '2025-01-01',
  ageRating: 12,
  backdropUrl: '',
  compactPosterUrl: '/compact.jpg',
  countries: [],
  description: '',
  director: ['Director'],
  enName: 'Original title',
  extension: 'MKV',
  genres: ['Drama'],
  id: 'movie-1',
  isSeries: false,
  kpId: 1,
  posterUrl: '/poster.jpg',
  name: 'Movie title',
  movieLength: 127,
  actors: [],
  quality: '4K',
  rating: 8.4,
  year: 2024,
  sequelsAndPrequels: [],
  similarMovies: [],
};

const params: MoviesParams = {
  ageRating: [12, 16],
  actors: 'Actor',
  currentPage: 0,
  direction: 'desc',
  directors: 'Director One,Director Two',
  fromYear: 2000,
  genres: ['Drama', 'Comedy'],
  key: 'addedDate',
  pageSize: 30,
  quality: ['4K UHD', '4K HDR'],
  rating: 7,
  search: 'Movie',
  toYear: 2025,
};

describe('HttpMoviesRepository', () => {
  it('loads gallery media from the configured endpoint and converts it for the UI', () => {
    TestBed.configureTestingModule({
      providers: [
        HttpMoviesRepository,
        MoviesApiClient,
        provideEnvironment(testEnvironment),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const repository = TestBed.inject(HttpMoviesRepository);
    const http = TestBed.inject(HttpTestingController);
    let currentPage = -1;
    let mediaTitle = '';

    repository.find(params).subscribe((page) => {
      currentPage = page.currentPage;
      mediaTitle = page.media[0]?.title ?? '';
    });

    const request = http.expectOne(({ url }) => url === 'http://localhost:4200/api/movies');
    expect(request.request.headers.keys()).toEqual([]);
    expect(request.request.params.get('currentPage')).toBe('0');
    expect(request.request.params.get('direction')).toBe('desc');
    expect(request.request.params.get('key')).toBe('addedDate');
    expect(request.request.params.get('pageSize')).toBe('30');
    expect(request.request.params.get('actors')).toBe('Actor');
    expect(request.request.params.getAll('ageRating')).toEqual(['12', '16']);
    expect(request.request.params.get('directors')).toBe('Director One,Director Two');
    expect(request.request.params.get('fromYear')).toBe('2000');
    expect(request.request.params.getAll('genres')).toEqual(['Drama', 'Comedy']);
    expect(request.request.params.getAll('quality')).toEqual(['4K UHD', '4K HDR']);
    expect(request.request.params.get('rating')).toBe('7');
    expect(request.request.params.get('search')).toBe('Movie');
    expect(request.request.params.get('toYear')).toBe('2025');
    request.flush({ currentPage: '0', list: [mediaDto], totalCount: 61 });

    expect(currentPage).toBe(0);
    expect(mediaTitle).toBe('Movie title');
    http.verify();
  });

  it('loads one movie by its encoded ID and converts the detail response', () => {
    TestBed.configureTestingModule({
      providers: [
        HttpMoviesRepository,
        MoviesApiClient,
        provideEnvironment(testEnvironment),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const repository = TestBed.inject(HttpMoviesRepository);
    const http = TestBed.inject(HttpTestingController);
    let title = '';

    repository.findById('movie/one').subscribe((movie) => {
      title = movie.title;
    });

    const request = http.expectOne('http://localhost:4200/api/movies/movie%2Fone');
    expect(request.request.params.keys()).toEqual([]);
    request.flush(mediaDto);

    expect(title).toBe('Movie title');
    http.verify();
  });

  it('loads an editor model and sends exact add, update, and delete mutations', () => {
    TestBed.configureTestingModule({
      providers: [
        HttpMoviesRepository,
        MoviesApiClient,
        provideEnvironment(testEnvironment),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const repository = TestBed.inject(HttpMoviesRepository);
    const http = TestBed.inject(HttpTestingController);

    repository.getForEdit('movie/one').subscribe();
    const getRequest = http.expectOne('http://localhost:4200/api/movies/movie%2Fone');
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush(mediaDto);

    repository.create(toMovieEditorModel(mediaDto)).subscribe();
    const postRequest = http.expectOne('http://localhost:4200/api/movies');
    expect(postRequest.request.method).toBe('POST');
    expect(postRequest.request.body).toEqual(mediaDto);
    postRequest.flush(mediaDto);

    repository.update(toMovieEditorModel(mediaDto)).subscribe();
    const putRequest = http.expectOne('http://localhost:4200/api/movies');
    expect(putRequest.request.method).toBe('PUT');
    expect(putRequest.request.body).toEqual(mediaDto);
    putRequest.flush(mediaDto);

    repository.delete('movie/one').subscribe();
    const deleteRequest = http.expectOne('http://localhost:4200/api/movies/movie%2Fone');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);

    http.verify();
  });

  it('rejects malformed transport responses before conversion', () => {
    TestBed.configureTestingModule({
      providers: [
        HttpMoviesRepository,
        MoviesApiClient,
        provideEnvironment(testEnvironment),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const repository = TestBed.inject(HttpMoviesRepository);
    const http = TestBed.inject(HttpTestingController);
    const error = vi.fn();

    repository.find(params).subscribe({ error });
    http.expectOne(({ url }) => url === 'http://localhost:4200/api/movies').flush({ currentPage: 0, list: null, totalCount: 1 });

    expect(error).toHaveBeenCalledWith(expect.any(AppError));
    http.verify();
  });
});
