/** Domain data preserves unknown metadata rather than inventing card display values. */
export type TitleFormat = { readonly qualityId: string; readonly extensionId: string };
export type SeriesSeason = {
  readonly seasonNumber: number;
  readonly releaseYear: number | null;
  readonly isAvailable: boolean;
  readonly formats: readonly TitleFormat[];
};
export type SeriesDetails = {
  readonly startYear: number | null;
  readonly endYear: number | null;
  readonly productionStatus: 'unknown' | 'in_production' | 'finished';
  readonly announcedSeasonCount: number | null;
  readonly seasons: readonly SeriesSeason[];
};
type TitleMetadata = {
  readonly id: string;
  readonly addedDate: string;
  readonly title: string;
  readonly originalTitle: string;
  readonly ageRating: number | null;
  readonly backdropUrl: string;
  readonly compactPosterUrl: string;
  readonly posterUrl: string;
  readonly countries: readonly string[];
  readonly description: string;
  readonly directors: readonly string[];
  readonly genres: readonly string[];
  readonly actors: readonly string[];
  readonly sequelsAndPrequels: readonly string[];
  readonly similarMovies: readonly string[];
  readonly kpId: string | null;
  readonly year: number | readonly (number | null)[] | null;
  readonly durationMinutes: number | null;
  readonly rating: number | null;
  readonly releaseDate: string | null;
  readonly formats: readonly TitleFormat[];
};
export type SeriesTitle = TitleMetadata & {
  readonly kind: 'series';
  readonly series: SeriesDetails;
  readonly availableSeasonCount: number;
};
export type MovieTitle = TitleMetadata & {
  readonly kind: 'movie';
  readonly series: null;
  readonly availableSeasonCount: null;
};
export type Title = MovieTitle | SeriesTitle;

/** PUT replaces the full draft. Server IDs and derived season counts cannot be written. */
type TitleDraftMetadata = Omit<TitleMetadata, 'id' | 'year'> & { readonly year: number | readonly number[] | null };
export type SeriesDraft = TitleDraftMetadata & Pick<SeriesTitle, 'kind' | 'series'>;
export type TitleDraft = SeriesDraft | (TitleDraftMetadata & Pick<MovieTitle, 'kind' | 'series'>);
