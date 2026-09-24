import { type ParamMap } from '@angular/router';
import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import { type MoviesParams, type SortingDirection, type SortingKey } from '../models/movies-params';

export const DEFAULT_MOVIES_PARAMS: MoviesParams = {
  currentPage: 0,
  direction: 'desc',
  key: 'addedDate',
  pageSize: DEFAULT_PAGE_SIZE,
};

type MoviesQueryParams = Record<string, number | string | readonly string[]>;

const sortingDirections: readonly SortingDirection[] = ['asc', 'desc'];
const sortingKeys: readonly SortingKey[] = ['addedDate', 'ageRating', 'enName', 'name', 'quality', 'rating', 'year'];

export function readMoviesParams(paramMap: ParamMap): MoviesParams {
  return {
    currentPage: readNonNegativeInteger(paramMap.get('currentPage')) ?? DEFAULT_MOVIES_PARAMS.currentPage,
    direction: readValue(paramMap.get('direction'), sortingDirections) ?? DEFAULT_MOVIES_PARAMS.direction,
    key: readValue(paramMap.get('key'), sortingKeys) ?? DEFAULT_MOVIES_PARAMS.key,
    pageSize: readPositiveInteger(paramMap.get('pageSize')) ?? DEFAULT_MOVIES_PARAMS.pageSize,
    ...readStringParam(paramMap, 'actors'),
    ...readStringArrayParam(paramMap, 'directors'),
    ...readNumberParam(paramMap, 'fromYear'),
    ...readStringArrayParam(paramMap, 'genres'),
    ...readNumberParam(paramMap, 'rating'),
    ...readStringParam(paramMap, 'search'),
    ...readNumberParam(paramMap, 'toYear'),
  };
}

export function toMoviesQueryParams(params: MoviesParams): MoviesQueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && (!Array.isArray(value) || value.length > 0)),
  ) as MoviesQueryParams;
}

function readPositiveInteger(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function readNonNegativeInteger(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function readNumberParam(paramMap: ParamMap, key: string): Partial<MoviesParams> {
  const value = paramMap.get(key);
  if (value === null || value.trim() === '') return {};
  const parsed = Number(value);
  return Number.isFinite(parsed) ? { [key]: parsed } : {};
}

function readStringArrayParam(paramMap: ParamMap, key: string): Partial<MoviesParams> {
  const values = paramMap
    .getAll(key)
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 ? { [key]: values } : {};
}

function readStringParam(paramMap: ParamMap, key: string): Partial<MoviesParams> {
  const value = paramMap.get(key)?.trim();
  return value ? { [key]: value } : {};
}

function readValue<T extends string>(value: string | null, values: readonly T[]): T | undefined {
  return values.find((candidate) => candidate === value);
}
