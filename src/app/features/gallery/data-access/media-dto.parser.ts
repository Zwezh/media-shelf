import type { MediaDto } from '../models/media.dto';
import type { MoviesPageDto } from '../models/movies-page.dto';

export function parseMediaDto(value: unknown): MediaDto {
  const record = asRecord(value, 'movie');
  return {
    actors: stringArray(record['actors'], 'actors'),
    addedDate: stringValue(record['addedDate'], 'addedDate'),
    ageRating: nullableNumber(record['ageRating'], 'ageRating'),
    backdropUrl: stringValue(record['backdropUrl'], 'backdropUrl'),
    compactPosterUrl: stringValue(record['compactPosterUrl'], 'compactPosterUrl'),
    countries: stringArray(record['countries'], 'countries'),
    description: stringValue(record['description'], 'description'),
    director: stringArray(record['director'], 'director'),
    enName: stringValue(record['enName'], 'enName'),
    extension: stringValue(record['extension'], 'extension'),
    genres: stringArray(record['genres'], 'genres'),
    id: stringValue(record['id'], 'id'),
    isSeries: booleanValue(record['isSeries'], 'isSeries'),
    kpId: numberValue(record['kpId'], 'kpId'),
    movieLength: numberValue(record['movieLength'], 'movieLength'),
    name: stringValue(record['name'], 'name'),
    posterUrl: stringValue(record['posterUrl'], 'posterUrl'),
    quality: stringValue(record['quality'], 'quality'),
    rating: numberValue(record['rating'], 'rating'),
    sequelsAndPrequels: stringArray(record['sequelsAndPrequels'], 'sequelsAndPrequels'),
    similarMovies: stringArray(record['similarMovies'], 'similarMovies'),
    year: yearValue(record['year']),
  };
}

export function parseMoviesPageDto(value: unknown): MoviesPageDto {
  const record = asRecord(value, 'movies page');
  if (!Array.isArray(record['list'])) throw invalid('list');
  const currentPage = record['currentPage'];
  if (typeof currentPage !== 'number' && typeof currentPage !== 'string') throw invalid('currentPage');

  return {
    currentPage,
    list: record['list'].map(parseMediaDto),
    totalCount: numberValue(record['totalCount'], 'totalCount'),
  };
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid(field);
  return value as Record<string, unknown>;
}

function booleanValue(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw invalid(field);
  return value;
}

function nullableNumber(value: unknown, field: string): number | null | undefined {
  if (value === null || value === undefined) return value;
  return numberValue(value, field);
}

function numberValue(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(field);
  return value;
}

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw invalid(field);
  return [...value] as string[];
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== 'string') throw invalid(field);
  return value;
}

function yearValue(value: unknown): number | number[] {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value) && value.length > 0 && value.every((year) => typeof year === 'number' && Number.isFinite(year))) {
    return [...value] as number[];
  }
  throw invalid('year');
}

function invalid(field: string): TypeError {
  return new TypeError(`Invalid API response field: ${field}`);
}
