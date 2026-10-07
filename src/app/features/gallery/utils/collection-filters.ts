import { COLLECTION_FILTER_KEYS, type CollectionFilterKey, type CollectionFilters } from '../models/collection-filters';
import type { CollectionParams } from '../models/collection-params';

export function countActiveCollectionFilters(filters: CollectionFilters): number {
  const activeNonYearFilters = COLLECTION_FILTER_KEYS.filter(
    (key) => key !== 'fromYear' && key !== 'toYear' && hasFilterValue(filters[key]),
  ).length;
  return activeNonYearFilters + (filters.fromYear !== undefined || filters.toYear !== undefined ? 1 : 0);
}

export function extractCollectionFilters(params: CollectionParams<string>): CollectionFilters {
  return Object.fromEntries(
    COLLECTION_FILTER_KEYS.flatMap((key) => (params[key] === undefined ? [] : [[key, params[key]]])),
  ) as CollectionFilters;
}

export function removeCollectionFilter<T extends CollectionParams<string>>(params: T, key: CollectionFilterKey): T {
  return removeCollectionFilters(params, [key]);
}

export function removeCollectionFilters<T extends CollectionParams<string>>(params: T, keys: readonly CollectionFilterKey[]): T {
  const nextParams = { ...params };
  for (const key of keys) delete nextParams[key];
  return { ...nextParams, currentPage: 0 };
}

export function replaceCollectionFilters<T extends CollectionParams<string>>(params: T, filters: CollectionFilters): T {
  const nextParams = { ...params };
  for (const key of COLLECTION_FILTER_KEYS) delete nextParams[key];
  return { ...nextParams, ...filters, currentPage: 0 };
}

export function normalizeCommaSeparatedNames(value: string): string | undefined {
  const names = [
    ...new Set(
      value
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
  return names.length > 0 ? names.join(',') : undefined;
}

function hasFilterValue(value: CollectionFilters[CollectionFilterKey]): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== '';
}
