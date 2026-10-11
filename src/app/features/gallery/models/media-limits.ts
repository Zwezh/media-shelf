/** API limits shared by catalog parsers and editors. */
export const MEDIA_LIMITS = {
  minYear: 1,
  maxYear: 9999,
  maxRating: 10,
  maxAgeRating: 21,
  maxRuntimeMinutes: 100_000,
  maxSeasonNumber: 10_000,
  maxSeasons: 1000,
  maxFormats: 100,
  maxYears: 200,
} as const;

/** The existing cinema-focused filter/editor range is narrower than API years. */
export const RELEASE_YEAR_RANGE = { min: 1888, max: 2100 } as const;
