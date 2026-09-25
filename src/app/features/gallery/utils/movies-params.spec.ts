import { convertToParamMap } from '@angular/router';
import { SORTING_DIRECTIONS } from '../models/sorting-direction';
import { SORTING_KEYS } from '../models/sorting-key';
import { readMoviesParams, toMoviesQueryParams } from './movies-params';

describe('movie query params', () => {
  it('uses defaults for missing or invalid required values', () => {
    expect(readMoviesParams(convertToParamMap({ currentPage: '-1', direction: 'down', key: 'unknown', pageSize: 'none' }))).toEqual({
      currentPage: 0,
      direction: 'desc',
      key: 'addedDate',
      pageSize: 30,
    });
  });

  it('restores all filters from repeated and scalar URL values', () => {
    const params = readMoviesParams(
      convertToParamMap({
        actors: 'Actor One,Actor Two',
        ageRating: ['12', '16', '16'],
        directors: 'Director One,Director Two',
        fromYear: '2018',
        genres: ['Drama', 'Sci-Fi', 'Drama'],
        quality: ['4K UHD', '4K HDR'],
        rating: '7.5',
        toYear: '2024',
      }),
    );

    expect(params).toEqual({
      actors: 'Actor One,Actor Two',
      ageRating: [12, 16],
      currentPage: 0,
      direction: 'desc',
      directors: 'Director One,Director Two',
      fromYear: 2018,
      genres: ['Drama', 'Sci-Fi'],
      key: 'addedDate',
      pageSize: 30,
      quality: ['4K UHD', '4K HDR'],
      rating: 7.5,
      toYear: 2024,
    });
  });

  it('omits empty optional values when serializing', () => {
    expect(
      toMoviesQueryParams({
        currentPage: 0,
        direction: 'desc',
        genres: [],
        key: 'addedDate',
        pageSize: 30,
        quality: [],
      }),
    ).toEqual({ currentPage: 0, direction: 'desc', key: 'addedDate', pageSize: 30 });
  });

  it('accepts every shared sorting direction and key', () => {
    for (const direction of SORTING_DIRECTIONS) {
      for (const key of SORTING_KEYS) {
        expect(readMoviesParams(convertToParamMap({ direction, key }))).toEqual(expect.objectContaining({ direction, key }));
      }
    }
  });
});
