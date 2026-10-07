import { integer, nullableDate, nullableRange } from './title-values';
import { asRecord, booleanValue, invalid, stringValue } from '../../data-access/dto-values';
import { parseMediaMetadataDto } from '../../data-access/media-metadata.parser';
import type { CollectionPageDto } from '../../models/collection-page';
import type { SeriesDetailsDto, SeriesTitleDto, TitleDto, TitleFormatDto } from '../models/title.dto';

export function parseTitleDto(value: unknown): TitleDto {
  const record = asRecord(value, 'title');
  const kind = record['kind'];
  if (kind !== 'movie' && kind !== 'series') throw invalid('kind');
  const kpId = record['kpId'];
  if (
    kpId !== null &&
    (typeof kpId !== 'string' || kpId.length > 100 || !/^[1-9]\d*$/.test(kpId) || BigInt(kpId) > BigInt(Number.MAX_SAFE_INTEGER))
  )
    throw invalid('kpId');
  const metadata = {
    ...parseMediaMetadataDto(record),
    ageRating: nullableRange(record['ageRating'], 'ageRating', 0, 21),
    id: stringValue(record['id'], 'id'),
    kpId: kpId as string | null,
    year: parseYear(record['year'], kind === 'series'),
    movieLength: nullableRange(record['movieLength'], 'movieLength', 0, 100000),
    rating: nullableRange(record['rating'], 'rating', 0, 10, false),
    releaseDate: nullableDate(record['releaseDate'], 'releaseDate'),
    formats: parseFormats(record['formats']),
  };
  if (kind === 'movie') {
    if (record['series'] !== null || record['availableSeasonCount'] !== null) throw invalid('series');
    return { ...metadata, kind, series: null, availableSeasonCount: null };
  }
  return {
    ...metadata,
    kind,
    series: parseSeries(record['series']),
    availableSeasonCount: integer(record['availableSeasonCount'], 'availableSeasonCount', 0, 1000),
  };
}

export function parseSeriesTitleDto(value: unknown): SeriesTitleDto {
  const title = parseTitleDto(value);
  if (title.kind !== 'series') throw invalid('kind');
  return title;
}

export function parseTitlesPageDto<T extends TitleDto>(value: unknown, parseTitle: (value: unknown) => T): CollectionPageDto<T> {
  const record = asRecord(value, 'titles page');
  if (!Array.isArray(record['list'])) throw invalid('list');
  return {
    currentPage: integer(record['currentPage'], 'currentPage', 0, Number.MAX_SAFE_INTEGER),
    list: record['list'].map(parseTitle),
    totalCount: integer(record['totalCount'], 'totalCount', 0, Number.MAX_SAFE_INTEGER),
  };
}

function parseFormats(value: unknown): TitleFormatDto[] {
  if (!Array.isArray(value) || value.length > 100) throw invalid('formats');
  const formats = value.map((entry: unknown) => {
    const record = asRecord(entry, 'format');
    return { qualityId: stringValue(record['qualityId'], 'qualityId'), extensionId: stringValue(record['extensionId'], 'extensionId') };
  });
  if (
    formats.some((format) => !format.qualityId || !format.extensionId) ||
    new Set(formats.map((format) => JSON.stringify([format.qualityId, format.extensionId]))).size !== formats.length
  )
    throw invalid('formats');
  return formats;
}

function parseSeries(value: unknown): SeriesDetailsDto {
  const record = asRecord(value, 'series');
  const productionStatus = record['productionStatus'];
  if (productionStatus !== 'unknown' && productionStatus !== 'in_production' && productionStatus !== 'finished')
    throw invalid('productionStatus');
  const startYear = nullableRange(record['startYear'], 'startYear', 1, 9999);
  const endYear = nullableRange(record['endYear'], 'endYear', 1, 9999);
  if (endYear !== null && (startYear === null || endYear < startYear || productionStatus !== 'finished')) throw invalid('endYear');
  if (!Array.isArray(record['seasons']) || record['seasons'].length > 1000) throw invalid('seasons');
  const seasons = record['seasons'].map((entry: unknown) => {
    const season = asRecord(entry, 'season');
    return {
      seasonNumber: integer(season['seasonNumber'], 'seasonNumber', 0, 10000),
      releaseYear: nullableRange(season['releaseYear'], 'releaseYear', 1, 9999),
      isAvailable: booleanValue(season['isAvailable'], 'isAvailable'),
      formats: parseFormats(season['formats']),
    };
  });
  if (new Set(seasons.map((season) => season.seasonNumber)).size !== seasons.length) throw invalid('seasonNumber');
  return {
    startYear,
    endYear,
    productionStatus,
    announcedSeasonCount: nullableRange(record['announcedSeasonCount'], 'announcedSeasonCount', 0, 10000),
    seasons,
  };
}

function parseYear(value: unknown, allowUnknownEnd: boolean): number | (number | null)[] | null {
  if (value === null) return null;
  if (Array.isArray(value)) {
    if (!allowUnknownEnd && value.length === 0) throw invalid('year');
    return value.map((year: unknown) => (allowUnknownEnd && year === null ? null : integer(year, 'year', 1, 9999)));
  }
  return integer(value, 'year', 1, 9999);
}
