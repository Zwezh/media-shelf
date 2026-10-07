import type { ParamMap } from '@angular/router';
import type { CollectionParams } from '../models/collection-params';
import { SORTING_DIRECTIONS } from '../models/sorting-direction';
const MAX_PAGE_SIZE = 100;
const MIN_RELEASE_YEAR = 1888;
const MAX_RELEASE_YEAR = 2100;
export function readCollectionParams<TKey extends string>(
  paramMap: ParamMap,
  keys: readonly TKey[],
  defaults: CollectionParams<TKey>,
): CollectionParams<TKey> {
  return {
    ...readNumberArrayParam(paramMap, 'ageRating'),
    currentPage: readNonNegativeInteger(paramMap.get('currentPage')) ?? defaults.currentPage,
    direction: readValue(paramMap.get('direction'), SORTING_DIRECTIONS) ?? defaults.direction,
    key: readValue(paramMap.get('key'), keys) ?? defaults.key,
    pageSize: readPositiveInteger(paramMap.get('pageSize'), MAX_PAGE_SIZE) ?? defaults.pageSize,
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

function readNumberArrayParam(
  paramMap: ParamMap,
  key: string,
): Partial<Omit<CollectionParams<string>, 'key' | 'direction' | 'currentPage' | 'pageSize'>> {
  const values = paramMap
    .getAll(key)
    .map(Number)
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 18);
  return values.length > 0 ? { [key]: [...new Set(values)] } : {};
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

function readNumberParam(
  paramMap: ParamMap,
  key: string,
  minimum: number,
  maximum: number,
  integer = false,
): Partial<Omit<CollectionParams<string>, 'key' | 'direction' | 'currentPage' | 'pageSize'>> {
  const value = paramMap.get(key);
  if (value === null || value.trim() === '') return {};
  const parsed = Number(value);
  const hasValidPrecision = !integer || Number.isInteger(parsed);
  return Number.isFinite(parsed) && hasValidPrecision && parsed >= minimum && parsed <= maximum ? { [key]: parsed } : {};
}

function readStringArrayParam(
  paramMap: ParamMap,
  key: string,
): Partial<Omit<CollectionParams<string>, 'key' | 'direction' | 'currentPage' | 'pageSize'>> {
  const values = paramMap
    .getAll(key)
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 ? { [key]: [...new Set(values)] } : {};
}

function readStringParam(
  paramMap: ParamMap,
  key: string,
): Partial<Omit<CollectionParams<string>, 'key' | 'direction' | 'currentPage' | 'pageSize'>> {
  const value = paramMap.get(key)?.trim();
  return value ? { [key]: value } : {};
}

function readValue<T extends string>(value: string | null, values: readonly T[]): T | undefined {
  return values.find((candidate) => candidate === value);
}
