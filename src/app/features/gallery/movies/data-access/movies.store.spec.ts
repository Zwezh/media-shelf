import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MediaDto } from '../../models/media.dto';
import { MoviesStore } from './movies.store';

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

describe('MoviesStore', () => {
  it('loads and converts movies, then updates the current page', () => {
    TestBed.configureTestingModule({
      providers: [MoviesStore, provideHttpClient(), provideHttpClientTesting()],
    });

    const store = TestBed.inject(MoviesStore);
    const http = TestBed.inject(HttpTestingController);

    expect(store.isLoading()).toBe(true);
    http.expectOne('/mock-data.json').flush([mediaDto]);

    expect(store.isLoading()).toBe(false);
    expect(store.hasError()).toBe(false);
    expect(store.media()[0]).toMatchObject({ id: 'movie-1', title: 'Movie title' });
    expect(store.visibleMedia()).toHaveLength(1);

    store.changePage(2);
    expect(store.page()).toBe(2);
    expect(store.visibleMedia()).toEqual([]);
  });

  it('exposes a recoverable error state when loading fails', () => {
    TestBed.configureTestingModule({
      providers: [MoviesStore, provideHttpClient(), provideHttpClientTesting()],
    });

    const store = TestBed.inject(MoviesStore);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/mock-data.json').flush('Failed', { status: 500, statusText: 'Server Error' });

    expect(store.isLoading()).toBe(false);
    expect(store.hasError()).toBe(true);
    expect(store.media()).toEqual([]);
  });
});
