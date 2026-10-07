import { asRecord, booleanValue, invalid, numberValue, stringValue, yearValue } from './dto-values';
import { parseMediaMetadataDto } from './media-metadata.parser';
import type { MediaDto } from '../models/media.dto';
import type { MoviesPageDto } from '../models/movies-page.dto';

export function parseMediaDto(value: unknown): MediaDto {
  const record = asRecord(value, 'movie');
  return {
    ...parseMediaMetadataDto(record),
    extension: stringValue(record['extension'], 'extension'),
    id: stringValue(record['id'], 'id'),
    isSeries: booleanValue(record['isSeries'], 'isSeries'),
    kpId: numberValue(record['kpId'], 'kpId'),
    movieLength: numberValue(record['movieLength'], 'movieLength'),
    quality: stringValue(record['quality'], 'quality'),
    rating: numberValue(record['rating'], 'rating'),
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
