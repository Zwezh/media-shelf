import type { AutofillMetadata } from '../../models/autofill-metadata';
import type { SeriesAutofill } from './title-autofill';

/** Authenticated backend response, separate from full persisted TitleDto. */
export type TitleAutofillDto = AutofillMetadata & {
  readonly kind: 'movie' | 'series' | null;
  readonly kpId: string;
  readonly ageRating: number | null;
  readonly movieLength: number | null;
  readonly rating: number | null;
  readonly year: number | readonly number[] | null;
  readonly releaseDate: string | null;
  readonly series: SeriesAutofill | null;
};
