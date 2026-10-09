import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import type { CollectionParams } from '../../models/collection-params';

/** These keys are accepted by TitlesRepository, which rejects quality/extension sorting. */
export const CATALOG_SORTING_KEYS = ['addedDate', 'ageRating', 'enName', 'kpId', 'movieLength', 'name', 'rating', 'year'] as const;
export type CatalogSortingKey = (typeof CATALOG_SORTING_KEYS)[number];
export type CatalogParams = CollectionParams<CatalogSortingKey>;
export const DEFAULT_CATALOG_PARAMS: CatalogParams = { currentPage: 0, pageSize: DEFAULT_PAGE_SIZE, key: 'addedDate', direction: 'desc' };
