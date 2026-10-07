import type { SortingDirection } from './sorting-direction';

export type CollectionParams<TKey extends string> = {
  ageRating?: number[];
  currentPage: number;
  direction: SortingDirection;
  key: TKey;
  pageSize: number;
  actors?: string;
  directors?: string;
  fromYear?: number;
  genres?: string[];
  quality?: string[];
  rating?: number;
  search?: string;
  toYear?: number;
};
