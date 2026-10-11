import { toLocalDate } from '@msh-shared/utils/date';
import type { EditorMetadataModel } from '../../catalog/models/editor-fields';
import type { SeriesDetails, SeriesDraft, SeriesTitle } from '../../catalog/models/title';

export type SeasonEditorModel = {
  readonly key: number;
  readonly seasonNumber: string;
  readonly releaseYear: string;
  readonly isAvailable: boolean;
  readonly qualityId: string;
  readonly extensionId: string;
};
export type SeriesEditorModel = EditorMetadataModel & {
  readonly original?: SeriesDraft | SeriesTitle;
  readonly releaseDate: string;
  readonly startYear: string;
  readonly endYear: string;
  readonly productionStatus: SeriesDetails['productionStatus'];
  readonly announcedSeasonCount: string;
  readonly seasons: readonly SeasonEditorModel[];
};

export function createSeriesEditorModel(): SeriesEditorModel {
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
    addedDate: toLocalDate(new Date()),
    releaseDate: '',
    startYear: '',
    endYear: '',
    productionStatus: 'unknown',
    announcedSeasonCount: '',
    seasons: [],
  };
}
