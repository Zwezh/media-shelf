import type { ProductionStatus } from '../../../models/production-status';
import type { CollectionFilters } from '../../../models/collection-filters';
import { normalizeCommaSeparatedNames } from '../../../utils/collection-filters';

export type MoviesFilterFormModel = {
  productionStatus: ProductionStatus | '';
  seasonAvailability: boolean;
  actors: string;
  ageRating: number[];
  directors: string;
  fromYear: string;
  genres: string[];
  quality: string[];
  rating: number;
  toYear: string;
};

export const EMPTY_FORM: MoviesFilterFormModel = {
  productionStatus: '',
  seasonAvailability: false,
  actors: '',
  ageRating: [],
  directors: '',
  fromYear: '',
  genres: [],
  quality: [],
  rating: 0,
  toYear: '',
};

export function toFormModel(filters: CollectionFilters): MoviesFilterFormModel {
  return {
    productionStatus: filters.productionStatus ?? '',
    seasonAvailability: filters.seasonAvailability === 'incomplete',
    actors: filters.actors ?? '',
    ageRating: [...(filters.ageRating ?? [])],
    directors: filters.directors ?? '',
    fromYear: filters.fromYear?.toString() ?? '',
    genres: [...(filters.genres ?? [])],
    quality: [...(filters.quality ?? [])],
    rating: filters.rating ?? 0,
    toYear: filters.toYear?.toString() ?? '',
  };
}

export function toCollectionFilters(value: MoviesFilterFormModel): CollectionFilters {
  const actors = normalizeCommaSeparatedNames(value.actors);
  const directors = normalizeCommaSeparatedNames(value.directors);
  const fromYear = value.fromYear ? Number(value.fromYear) : undefined;
  const toYear = value.toYear ? Number(value.toYear) : undefined;

  return {
    ...(value.productionStatus ? { productionStatus: value.productionStatus } : {}),
    ...(value.seasonAvailability ? { seasonAvailability: 'incomplete' as const } : {}),
    ...(actors ? { actors } : {}),
    ...(value.ageRating.length ? { ageRating: [...value.ageRating].sort((left, right) => left - right) } : {}),
    ...(directors ? { directors } : {}),
    ...(fromYear ? { fromYear } : {}),
    ...(value.genres.length ? { genres: [...value.genres] } : {}),
    ...(value.quality.length ? { quality: [...value.quality] } : {}),
    ...(value.rating > 0 ? { rating: value.rating } : {}),
    ...(toYear ? { toYear } : {}),
  };
}

export function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
}

export function areCollectionFiltersEqual(left: CollectionFilters, right: CollectionFilters): boolean {
  return (
    left.productionStatus === right.productionStatus &&
    left.seasonAvailability === right.seasonAvailability &&
    left.actors === right.actors &&
    left.directors === right.directors &&
    left.fromYear === right.fromYear &&
    left.rating === right.rating &&
    left.toYear === right.toYear &&
    haveSameValues(left.ageRating, right.ageRating) &&
    haveSameValues(left.genres, right.genres) &&
    haveSameValues(left.quality, right.quality)
  );
}

function haveSameValues<T>(left: readonly T[] | undefined, right: readonly T[] | undefined): boolean {
  const leftValues = left ?? [];
  const rightValues = right ?? [];
  return leftValues.length === rightValues.length && leftValues.every((value) => rightValues.includes(value));
}
