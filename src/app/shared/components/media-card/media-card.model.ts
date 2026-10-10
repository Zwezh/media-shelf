export interface MediaCardModel {
  readonly ageRating: string | null;
  readonly director: string;
  readonly durationMinutes: number | null;
  readonly genres: readonly string[];
  readonly id: string;
  readonly originalTitle: string;
  readonly posterUrl: string;
  readonly quality?: string | null;
  readonly rating: number | null;
  readonly title: string;
  readonly type: 'movie' | 'series';
  readonly year: string;
}
