import { AppError } from '@msh-core/http/app-error';
import { parseAutofillMetadata } from '../../data-access/autofill-metadata.parser';
import { asRecord, invalid, stringValue } from '../../data-access/dto-values';
import type { SeriesAutofill, TitleAutofill } from '../models/title-autofill';
import type { TitleAutofillDto } from '../models/title-autofill.dto';
import { integer, nullableDate, nullableRange } from './title-values';

export function parseTitleAutofillDto(value: unknown): TitleAutofillDto {
  const body = asRecord(value, 'title autofill');
  const kind = body['kind'];
  if (kind !== null && kind !== 'movie' && kind !== 'series') throw invalid('kind');
  const kpId = stringValue(body['kpId'], 'kpId');
  if (kpId.length > 100 || !/^[1-9]\d*$/.test(kpId) || BigInt(kpId) > BigInt(Number.MAX_SAFE_INTEGER)) throw invalid('kpId');
  const year = body['year'];
  const years = Array.isArray(year) ? year.map((value: unknown) => integer(value, 'year', 1, 9999)) : nullableRange(year, 'year', 1, 9999);
  if (Array.isArray(years) && (years.length === 0 || years.length > 200 || new Set(years).size !== years.length)) throw invalid('year');
  const series = body['series'];
  if (kind !== 'series' && series !== null) throw invalid('series');
  return {
    ...parseAutofillMetadata(value),
    kind,
    kpId,
    ageRating: nullableRange(body['ageRating'], 'ageRating', 0, 21),
    movieLength: nullableRange(body['movieLength'], 'movieLength', 0, 100000),
    rating: nullableRange(body['rating'], 'rating', 0, 10, false),
    year: years,
    releaseDate: nullableDate(body['releaseDate'], 'releaseDate'),
    series: kind === 'series' ? parseSeriesAutofill(series) : null,
  };
}

export function toTitleAutofill(dto: TitleAutofillDto): TitleAutofill {
  const { name, enName, movieLength, ...metadata } = dto;
  return { ...metadata, title: name, originalTitle: enName, durationMinutes: movieLength };
}

export function assertAutofillId(expected: string, actual: string): void {
  if (expected !== actual) throw new AppError('unexpected', 'Autofill returned a different title.');
}

function parseSeriesAutofill(value: unknown): SeriesAutofill {
  const body = asRecord(value, 'series autofill');
  const productionStatus = body['productionStatus'];
  if (productionStatus !== 'unknown' && productionStatus !== 'in_production' && productionStatus !== 'finished')
    throw invalid('productionStatus');
  const startYear = nullableRange(body['startYear'], 'startYear', 1, 9999);
  const endYear = nullableRange(body['endYear'], 'endYear', 1, 9999);
  if (endYear !== null && (startYear === null || endYear < startYear || productionStatus !== 'finished')) throw invalid('endYear');
  if (!Array.isArray(body['seasons']) || body['seasons'].length > 1000) throw invalid('seasons');
  const seasons = body['seasons'].map((value: unknown) => {
    const season = asRecord(value, 'season autofill');
    return {
      seasonNumber: integer(season['seasonNumber'], 'seasonNumber', 0, 10000),
      releaseYear: nullableRange(season['releaseYear'], 'releaseYear', 1, 9999),
    };
  });
  if (new Set(seasons.map((season) => season.seasonNumber)).size !== seasons.length) throw invalid('seasonNumber');
  return {
    startYear,
    endYear,
    productionStatus,
    announcedSeasonCount: nullableRange(body['announcedSeasonCount'], 'announcedSeasonCount', 0, 10000),
    seasons,
  };
}
