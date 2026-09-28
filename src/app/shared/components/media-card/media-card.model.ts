export interface MediaCardModel {
  readonly ageRating: string;
  readonly director: string;
  readonly durationMinutes: number;
  readonly genres: readonly string[];
  readonly id: string;
  readonly originalTitle: string;
  readonly posterUrl: string;
  readonly quality: string;
  readonly rating: number;
  readonly title: string;
  readonly type: 'movie' | 'series';
  readonly year: string;
}
