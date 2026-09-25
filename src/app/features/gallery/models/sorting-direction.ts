export const SORTING_DIRECTIONS = ['asc', 'desc'] as const;

export type SortingDirection = (typeof SORTING_DIRECTIONS)[number];
