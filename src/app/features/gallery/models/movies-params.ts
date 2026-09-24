export type MoviesParams = {
  currentPage: number;
  direction: SortingDirection;
  key: SortingKey;
  pageSize: number;
  actors?: string;
  directors?: string[];
  fromYear?: number;
  genres?: string[];
  rating?: number;
  search?: string;
  toYear?: number;
};

export type SortingDirection = 'asc' | 'desc';

export type SortingKey = 'addedDate' | 'ageRating' | 'enName' | 'name' | 'quality' | 'rating' | 'year';
