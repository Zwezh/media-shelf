import { type MovieAutofill } from '../../../movie-editor/models/movie-autofill.model';

export function parseMovieAutofill(value: unknown): MovieAutofill {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid('movie');
  const body = value as Record<string, unknown>;
  return {
    actors: strings(body['actors'], 'actors'),
    ageRating: optionalNumber(body['ageRating'], 'ageRating', 0, 21),
    backdropUrl: text(body['backdropUrl'], 'backdropUrl'),
    compactPosterUrl: text(body['compactPosterUrl'], 'compactPosterUrl'),
    countries: strings(body['countries'], 'countries'),
    description: text(body['description'], 'description'),
    directors: strings(body['directors'], 'directors'),
    enName: text(body['enName'], 'enName'),
    genres: strings(body['genres'], 'genres'),
    kpId: number(body['kpId'], 'kpId', 1, Number.MAX_SAFE_INTEGER),
    movieLength: optionalNumber(body['movieLength'], 'movieLength', 0, 100000),
    name: text(body['name'], 'name'),
    posterUrl: text(body['posterUrl'], 'posterUrl'),
    rating: optionalNumber(body['rating'], 'rating', 0, 10, false),
    sequelsAndPrequels: strings(body['sequelsAndPrequels'], 'sequelsAndPrequels'),
    similarMovies: strings(body['similarMovies'], 'similarMovies'),
    year: optionalNumber(body['year'], 'year', 1, 9999),
  };
}

function text(value: unknown, field: string): string {
  if (typeof value !== 'string') throw invalid(field);
  return value;
}

function strings(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item: unknown) => typeof item !== 'string')) throw invalid(field);
  return [...value] as string[];
}

function number(value: unknown, field: string, min: number, max: number, integer = true): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) {
    throw invalid(field);
  }
  return value;
}

function optionalNumber(value: unknown, field: string, min: number, max: number, integer = true): number | undefined {
  return value === undefined ? undefined : number(value, field, min, max, integer);
}

function invalid(field: string): TypeError {
  return new TypeError(`Invalid movie autofill response field: ${field}`);
}
