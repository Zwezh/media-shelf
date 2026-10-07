import type { FieldTree } from '@angular/forms/signals';

export type EditorMetadataModel = {
  readonly name: string;
  readonly enName: string;
  readonly description: string;
  readonly genres: string[];
  readonly rating: string;
  readonly ageRating: string;
  readonly movieLength: string;
  readonly kpId: string;
  readonly posterUrl: string;
  readonly backdropUrl: string;
  readonly compactPosterUrl: string;
  readonly directors: string;
  readonly countries: string;
  readonly actors: string;
  readonly sequelsAndPrequels: string;
  readonly similarMovies: string;
  readonly addedDate: string;
};
export type EditorFields<K extends keyof EditorMetadataModel> = Pick<FieldTree<EditorMetadataModel>, K>;
