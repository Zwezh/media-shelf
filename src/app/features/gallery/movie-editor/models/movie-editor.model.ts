import type { EditorMetadataModel } from '../../catalog/models/editor-fields';
export type MovieEditorMode = 'add' | 'edit';

export type MovieEditorModel = EditorMetadataModel & {
  readonly extension: string;
  readonly id: string;
  readonly quality: string;
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
