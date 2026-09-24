import { type MoviesParams } from './movies-params';

export const MOVIE_FILTER_KEYS = ['actors', 'ageRating', 'directors', 'fromYear', 'genres', 'quality', 'rating', 'toYear'] as const;

export type MovieFilterKey = (typeof MOVIE_FILTER_KEYS)[number];
export type MoviesFilters = Pick<MoviesParams, MovieFilterKey>;
