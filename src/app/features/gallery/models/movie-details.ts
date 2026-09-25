export interface MovieDetails {
  readonly addedDate: Date | null;
  readonly ageRating: string;
  readonly backdropUrl: string;
  readonly countries: readonly string[];
  readonly description: string;
  readonly directors: readonly string[];
  readonly durationMinutes: number;
  readonly extension: string;
  readonly genres: readonly string[];
  readonly id: string;
  readonly kpId: number;
  readonly originalTitle: string;
  readonly posterUrl: string;
  readonly quality: string;
  readonly rating: number;
  readonly sequelsAndPrequels: readonly string[];
  readonly similarMovies: readonly string[];
  readonly title: string;
  readonly type: 'movie' | 'series';
  readonly year: string;
  readonly actors: readonly string[];
}
