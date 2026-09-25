export const SORTING_KEYS = ['addedDate', 'ageRating', 'enName', 'name', 'quality', 'rating', 'year'] as const;

export type SortingKey = (typeof SORTING_KEYS)[number];
