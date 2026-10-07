import type { Media } from './media';

export type MovieDetails = Pick<
  Media,
  'ageRating' | 'durationMinutes' | 'genres' | 'id' | 'originalTitle' | 'posterUrl' | 'quality' | 'rating' | 'title' | 'type' | 'year'
> & {
  readonly addedDate: Date | null;
  readonly backdropUrl: string;
  readonly countries: readonly string[];
  readonly description: string;
  readonly directors: readonly string[];
  readonly extension: string;
  readonly kpId: number;
  readonly sequelsAndPrequels: readonly string[];
  readonly similarMovies: readonly string[];
  readonly actors: readonly string[];
};
