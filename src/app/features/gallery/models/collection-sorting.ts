import type { CatalogSortingKey } from '../catalog/models/catalog-params';
import type { SortingKey } from './sorting-key';
import type { SortingDirection } from './sorting-direction';
export type CollectionSortingKey = SortingKey | CatalogSortingKey;
export type CollectionSorting = { readonly key: CollectionSortingKey; readonly direction: SortingDirection };
