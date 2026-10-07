import type { CollectionFilterKey, CollectionFilters } from '../models/collection-filters';
export type FilterChip = {
  readonly key: CollectionFilterKey;
  readonly filterKeys: readonly CollectionFilterKey[];
  readonly labelKey: string;
  readonly value: string;
};

export function toCollectionFilterChips(filters: CollectionFilters): FilterChip[] {
  return [
    ...(filters.genres?.length
      ? [
          {
            key: 'genres' as const,
            filterKeys: ['genres' as const],
            labelKey: 'movies.filters.genreChip',
            value: filters.genres.join(', '),
          },
        ]
      : []),
    ...(filters.fromYear || filters.toYear
      ? [
          {
            key: 'fromYear' as const,
            filterKeys: ['fromYear' as const, 'toYear' as const],
            labelKey: 'movies.filters.yearsChip',
            value: `${filters.fromYear ?? '…'}–${filters.toYear ?? '…'}`,
          },
        ]
      : []),
    ...(filters.rating
      ? [
          {
            key: 'rating' as const,
            filterKeys: ['rating' as const],
            labelKey: 'movies.filters.ratingChip',
            value: `${filters.rating}+`,
          },
        ]
      : []),
    ...(filters.ageRating?.length
      ? [
          {
            key: 'ageRating' as const,
            filterKeys: ['ageRating' as const],
            labelKey: 'movies.filters.ageChip',
            value: filters.ageRating.map((rating) => `${rating}+`).join(', '),
          },
        ]
      : []),
    ...(filters.quality?.length
      ? [
          {
            key: 'quality' as const,
            filterKeys: ['quality' as const],
            labelKey: 'movies.filters.qualityChip',
            value: filters.quality.join(', '),
          },
        ]
      : []),
    ...(filters.actors
      ? [
          {
            key: 'actors' as const,
            filterKeys: ['actors' as const],
            labelKey: 'movies.filters.actorsChip',
            value: filters.actors,
          },
        ]
      : []),
    ...(filters.directors
      ? [
          {
            key: 'directors' as const,
            filterKeys: ['directors' as const],
            labelKey: 'movies.filters.directorsChip',
            value: filters.directors,
          },
        ]
      : []),
  ];
}
