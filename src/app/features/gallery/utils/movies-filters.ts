import { MOVIE_FILTER_KEYS, type MovieFilterKey, type MoviesFilters } from '../models/movies-filters';
import { type MoviesParams } from '../models/movies-params';

export function countActiveMovieFilters(filters: MoviesFilters): number {
  const activeNonYearFilters = MOVIE_FILTER_KEYS.filter(
    (key) => key !== 'fromYear' && key !== 'toYear' && hasFilterValue(filters[key]),
  ).length;
  return activeNonYearFilters + (filters.fromYear !== undefined || filters.toYear !== undefined ? 1 : 0);
}

export function extractMoviesFilters(params: MoviesParams): MoviesFilters {
  return Object.fromEntries(MOVIE_FILTER_KEYS.flatMap((key) => (params[key] === undefined ? [] : [[key, params[key]]]))) as MoviesFilters;
}

export function removeMovieFilter(params: MoviesParams, key: MovieFilterKey): MoviesParams {
  return removeMovieFilters(params, [key]);
}

export function removeMovieFilters(params: MoviesParams, keys: readonly MovieFilterKey[]): MoviesParams {
  const nextParams = { ...params };
  for (const key of keys) delete nextParams[key];
  return { ...nextParams, currentPage: 0 };
}

export function replaceMovieFilters(params: MoviesParams, filters: MoviesFilters): MoviesParams {
  const nextParams = { ...params };
  for (const key of MOVIE_FILTER_KEYS) delete nextParams[key];
  return { ...nextParams, ...filters, currentPage: 0 };
}

export function normalizeCommaSeparatedNames(value: string): string | undefined {
  const names = [
    ...new Set(
      value
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
  return names.length > 0 ? names.join(',') : undefined;
}

function hasFilterValue(value: MoviesFilters[MovieFilterKey]): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== '';
}
