import type { CollectionParams } from './collection-params';

export const COLLECTION_FILTER_KEYS = ['actors', 'ageRating', 'directors', 'fromYear', 'genres', 'quality', 'rating', 'toYear'] as const;

export type CollectionFilterKey = (typeof COLLECTION_FILTER_KEYS)[number];
export type CollectionFilters = Pick<CollectionParams<string>, CollectionFilterKey>;
