import { type SortingDirection } from './sorting-direction';
import { type SortingKey } from './sorting-key';

export type MoviesParams = {
  ageRating?: number[];
  currentPage: number;
  direction: SortingDirection;
  key: SortingKey;
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

export type { SortingDirection } from './sorting-direction';
export type { SortingKey } from './sorting-key';
