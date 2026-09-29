import { type ParamMap } from '@angular/router';
import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import { type MoviesParams } from '../models/movies-params';
import { SORTING_DIRECTIONS } from '../models/sorting-direction';
import { SORTING_KEYS } from '../models/sorting-key';

const MAX_PAGE_SIZE = 100;
const MIN_RELEASE_YEAR = 1888;
const MAX_RELEASE_YEAR = 2100;

export const DEFAULT_MOVIES_PARAMS: MoviesParams = {
  currentPage: 0,
  direction: 'desc',
  key: 'addedDate',
  pageSize: DEFAULT_PAGE_SIZE,
};

export type MoviesQueryParams = Record<string, number | string | readonly (number | string)[]>;

export function readMoviesParams(paramMap: ParamMap): MoviesParams {
  return {
    ...readNumberArrayParam(paramMap, 'ageRating'),
    currentPage: readNonNegativeInteger(paramMap.get('currentPage')) ?? DEFAULT_MOVIES_PARAMS.currentPage,
    direction: readValue(paramMap.get('direction'), SORTING_DIRECTIONS) ?? DEFAULT_MOVIES_PARAMS.direction,
    key: readValue(paramMap.get('key'), SORTING_KEYS) ?? DEFAULT_MOVIES_PARAMS.key,
    pageSize: readPositiveInteger(paramMap.get('pageSize'), MAX_PAGE_SIZE) ?? DEFAULT_MOVIES_PARAMS.pageSize,
    ...readStringParam(paramMap, 'actors'),
    ...readStringParam(paramMap, 'directors'),
    ...readNumberParam(paramMap, 'fromYear', MIN_RELEASE_YEAR, MAX_RELEASE_YEAR, true),
    ...readStringArrayParam(paramMap, 'genres'),
    ...readStringArrayParam(paramMap, 'quality'),
    ...readNumberParam(paramMap, 'rating', 0, 10),
    ...readStringParam(paramMap, 'search'),
    ...readNumberParam(paramMap, 'toYear', MIN_RELEASE_YEAR, MAX_RELEASE_YEAR, true),
  };
}

function readNumberArrayParam(paramMap: ParamMap, key: string): Partial<MoviesParams> {
  const values = paramMap
    .getAll(key)
    .map(Number)
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 18);
  return values.length > 0 ? { [key]: [...new Set(values)] } : {};
}

export function toMoviesQueryParams(params: MoviesParams): MoviesQueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && (!Array.isArray(value) || value.length > 0)),
  ) as MoviesQueryParams;
}

function readPositiveInteger(value: string | null, maximum = Number.MAX_SAFE_INTEGER): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : undefined;
}

function readNonNegativeInteger(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function readNumberParam(paramMap: ParamMap, key: string, minimum: number, maximum: number, integer = false): Partial<MoviesParams> {
  const value = paramMap.get(key);
  if (value === null || value.trim() === '') return {};
  const parsed = Number(value);
  const hasValidPrecision = !integer || Number.isInteger(parsed);
  return Number.isFinite(parsed) && hasValidPrecision && parsed >= minimum && parsed <= maximum ? { [key]: parsed } : {};
}

function readStringArrayParam(paramMap: ParamMap, key: string): Partial<MoviesParams> {
  const values = paramMap
    .getAll(key)
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 ? { [key]: [...new Set(values)] } : {};
}

function readStringParam(paramMap: ParamMap, key: string): Partial<MoviesParams> {
  const value = paramMap.get(key)?.trim();
  return value ? { [key]: value } : {};
}

function readValue<T extends string>(value: string | null, values: readonly T[]): T | undefined {
  return values.find((candidate) => candidate === value);
}
