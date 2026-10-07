import type { MovieDetails } from '../../models/movie-details';
export type TitleDetailsView = Omit<MovieDetails, 'rating' | 'durationMinutes' | 'kpId' | 'ageRating' | 'quality' | 'extension'> & {
  readonly rating: number | null;
  readonly durationMinutes: number | null;
  readonly kpId: string | number | null;
  readonly ageRating: string | null;
  readonly quality: string | null;
};
