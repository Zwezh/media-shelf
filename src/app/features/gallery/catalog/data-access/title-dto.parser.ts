import { MEDIA_LIMITS } from '../../models/media-limits';
import { isProviderId } from '../../utils/provider-id';
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
  if (kpId !== null && !isProviderId(kpId)) throw invalid('kpId');
  const metadata = {
    ...parseMediaMetadataDto(record),
    ageRating: nullableRange(record['ageRating'], 'ageRating', 0, MEDIA_LIMITS.maxAgeRating),
    id: stringValue(record['id'], 'id'),
    kpId,
    year: parseYear(record['year'], kind === 'series'),
    movieLength: nullableRange(record['movieLength'], 'movieLength', 0, MEDIA_LIMITS.maxRuntimeMinutes),
    rating: nullableRange(record['rating'], 'rating', 0, MEDIA_LIMITS.maxRating, false),
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
    availableSeasonCount: integer(record['availableSeasonCount'], 'availableSeasonCount', 0, MEDIA_LIMITS.maxSeasons),
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
  if (!Array.isArray(value) || value.length > MEDIA_LIMITS.maxFormats) throw invalid('formats');
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
  const startYear = nullableRange(record['startYear'], 'startYear', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear);
  const endYear = nullableRange(record['endYear'], 'endYear', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear);
  if (endYear !== null && (startYear === null || endYear < startYear || productionStatus !== 'finished')) throw invalid('endYear');
  if (!Array.isArray(record['seasons']) || record['seasons'].length > MEDIA_LIMITS.maxSeasons) throw invalid('seasons');
  const seasons = record['seasons'].map((entry: unknown) => {
    const season = asRecord(entry, 'season');
    return {
      seasonNumber: integer(season['seasonNumber'], 'seasonNumber', 0, MEDIA_LIMITS.maxSeasonNumber),
      releaseYear: nullableRange(season['releaseYear'], 'releaseYear', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear),
      isAvailable: booleanValue(season['isAvailable'], 'isAvailable'),
      formats: parseFormats(season['formats']),
    };
  });
  if (new Set(seasons.map((season) => season.seasonNumber)).size !== seasons.length) throw invalid('seasonNumber');
  return {
    startYear,
    endYear,
    productionStatus,
    announcedSeasonCount: nullableRange(record['announcedSeasonCount'], 'announcedSeasonCount', 0, MEDIA_LIMITS.maxSeasonNumber),
    seasons,
  };
}

function parseYear(value: unknown, allowUnknownEnd: boolean): number | (number | null)[] | null {
  if (value === null) return null;
  if (Array.isArray(value)) {
    if (!allowUnknownEnd && value.length === 0) throw invalid('year');
    return value.map((year: unknown) =>
      allowUnknownEnd && year === null ? null : integer(year, 'year', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear),
    );
  }
  return integer(value, 'year', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear);
}
