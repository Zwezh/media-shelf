import type { AutofillMetadata } from '../models/autofill-metadata';
import { asRecord, stringArray, stringValue } from './dto-values';

export function parseAutofillMetadata(value: unknown): AutofillMetadata {
  const body = asRecord(value, 'autofill metadata');
  return {
    actors: stringArray(body['actors'], 'actors'),
    backdropUrl: stringValue(body['backdropUrl'], 'backdropUrl'),
    compactPosterUrl: stringValue(body['compactPosterUrl'], 'compactPosterUrl'),
    countries: stringArray(body['countries'], 'countries'),
    description: stringValue(body['description'], 'description'),
    directors: stringArray(body['directors'], 'directors'),
    enName: stringValue(body['enName'], 'enName'),
    genres: stringArray(body['genres'], 'genres'),
    name: stringValue(body['name'], 'name'),
    posterUrl: stringValue(body['posterUrl'], 'posterUrl'),
    sequelsAndPrequels: stringArray(body['sequelsAndPrequels'], 'sequelsAndPrequels'),
    similarMovies: stringArray(body['similarMovies'], 'similarMovies'),
  };
}
