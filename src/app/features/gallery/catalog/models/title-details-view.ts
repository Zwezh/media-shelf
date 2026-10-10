import type { MovieDetails } from '../../models/movie-details';
export type TitleDetailsView = Omit<
  MovieDetails,
  'rating' | 'durationMinutes' | 'kpId' | 'ageRating' | 'quality' | 'extension' | 'addedDate'
> & {
  readonly quality?: string | null;
  readonly addedDate?: Date | null;
  readonly rating: number | null;
  readonly durationMinutes: number | null;
  readonly kpId: string | number | null;
  readonly ageRating: string | null;
};
