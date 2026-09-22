export interface Media {
  readonly id: string;
  readonly title: string;
  readonly originalTitle: string;
  readonly posterUrl: string;
  readonly type: 'movie' | 'series';
  readonly quality: string;
  readonly rating: number;
  readonly ageRating: string;
  readonly year: string;
  readonly durationMinutes: number;
  readonly genres: readonly string[];
  readonly director: string;
}
