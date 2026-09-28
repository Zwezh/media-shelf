export type MovieEditorMode = 'add' | 'edit';

export type MovieEditorModel = {
  readonly addedDate: string;
  readonly actors: string;
  readonly ageRating: string;
  readonly backdropUrl: string;
  readonly compactPosterUrl: string;
  readonly countries: string;
  readonly description: string;
  readonly directors: string;
  readonly enName: string;
  readonly extension: string;
  readonly genres: string[];
  readonly id: string;
  readonly kpId: string;
  readonly movieLength: string;
  readonly name: string;
  readonly posterUrl: string;
  readonly quality: string;
  readonly rating: string;
  readonly sequelsAndPrequels: string;
  readonly similarMovies: string;
  readonly year: string;
};

export const createEmptyMovieEditorModel = (): MovieEditorModel => ({
  addedDate: toLocalDate(new Date()),
  actors: '',
  ageRating: '',
  backdropUrl: '',
  compactPosterUrl: '',
  countries: '',
  description: '',
  directors: '',
  enName: '',
  extension: '',
  genres: [],
  id: '',
  kpId: '',
  movieLength: '',
  name: '',
  posterUrl: '',
  quality: '',
  rating: '',
  sequelsAndPrequels: '',
  similarMovies: '',
  year: '',
});

function toLocalDate(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
