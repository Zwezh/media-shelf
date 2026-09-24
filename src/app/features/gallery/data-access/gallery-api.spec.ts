import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { environment } from '../../../../environments/environment';
import { type MediaDto } from '../models/media.dto';
import { type MoviesParams } from '../models/movies-params';
import { GalleryApi } from './gallery-api';

const testEnvironment = {
  ...environment,
  apiUrl: 'http://localhost:4200/api/',
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
  actors: 'Actor',
  currentPage: 0,
  direction: 'desc',
  directors: ['Director One', 'Director Two'],
  fromYear: 2000,
  genres: ['Drama', 'Comedy'],
  key: 'addedDate',
  pageSize: 30,
  rating: 7,
  search: 'Movie',
  toYear: 2025,
};

describe('GalleryApi', () => {
  it('loads gallery media from the configured endpoint and converts it for the UI', () => {
    TestBed.configureTestingModule({
      providers: [GalleryApi, provideEnvironment(testEnvironment), provideHttpClient(), provideHttpClientTesting()],
    });

    const api = TestBed.inject(GalleryApi);
    const http = TestBed.inject(HttpTestingController);
    let currentPage = -1;
    let mediaTitle = '';

    api.getMovies(params).subscribe((page) => {
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
    expect(request.request.params.get('directors')).toBe('Director One,Director Two');
    expect(request.request.params.get('fromYear')).toBe('2000');
    expect(request.request.params.getAll('genres')).toEqual(['Drama', 'Comedy']);
    expect(request.request.params.get('rating')).toBe('7');
    expect(request.request.params.get('search')).toBe('Movie');
    expect(request.request.params.get('toYear')).toBe('2025');
    request.flush({ currentPage: '0', list: [mediaDto], totalCount: 61 });

    expect(currentPage).toBe(0);
    expect(mediaTitle).toBe('Movie title');
    http.verify();
  });
});
