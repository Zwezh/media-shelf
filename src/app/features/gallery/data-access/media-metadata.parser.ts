import type { MediaMetadataDto } from '../models/media-metadata.dto';
import { asRecord, nullableNumber, stringArray, stringValue } from './dto-values';

export function parseMediaMetadataDto(value: unknown): MediaMetadataDto {
  const record = asRecord(value, 'metadata');
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
    genres: stringArray(record['genres'], 'genres'),
    name: stringValue(record['name'], 'name'),
    posterUrl: stringValue(record['posterUrl'], 'posterUrl'),
    sequelsAndPrequels: stringArray(record['sequelsAndPrequels'], 'sequelsAndPrequels'),
    similarMovies: stringArray(record['similarMovies'], 'similarMovies'),
  };
}
