import type { EditorMetadataModel } from '../../catalog/models/editor-fields';
import type { SeriesDetails } from '../../catalog/models/title';

export type SeasonEditorModel = {
  readonly key: number;
  readonly seasonNumber: string;
  readonly releaseYear: string;
  readonly isAvailable: boolean;
  readonly qualityId: string;
  readonly extensionId: string;
};
export type SeriesEditorModel = EditorMetadataModel & {
  readonly releaseDate: string;
  readonly startYear: string;
  readonly endYear: string;
  readonly productionStatus: SeriesDetails['productionStatus'];
  readonly announcedSeasonCount: string;
  readonly seasons: readonly SeasonEditorModel[];
};

export function createSeriesEditorModel(): SeriesEditorModel {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  return {
    name: '',
    enName: '',
    description: '',
    genres: [],
    rating: '',
    ageRating: '',
    movieLength: '',
    kpId: '',
    posterUrl: '',
    backdropUrl: '',
    compactPosterUrl: '',
    directors: '',
    countries: '',
    actors: '',
    sequelsAndPrequels: '',
    similarMovies: '',
    addedDate: localDate,
    releaseDate: '',
    startYear: '',
    endYear: '',
    productionStatus: 'unknown',
    announcedSeasonCount: '',
    seasons: [],
  };
}
