import type { SeriesDetails, SeriesSeason, TitleDraft } from './title';

export type SeriesAutofill = Omit<SeriesDetails, 'seasons'> & {
  readonly seasons: readonly Pick<SeriesSeason, 'seasonNumber' | 'releaseYear'>[];
};
export type TitleAutofill = Omit<TitleDraft, 'addedDate' | 'formats' | 'kind' | 'series' | 'kpId'> & {
  readonly kind: 'movie' | 'series' | null;
  readonly kpId: string;
  readonly series: SeriesAutofill | null;
};
