import type { SeriesDraft, SeriesTitle, TitleFormat } from '../../catalog/models/title';
import type { SeasonEditorModel, SeriesEditorModel } from '../models/series-editor.model';

export function toSeriesEditor(title: SeriesDraft | SeriesTitle, previous?: SeriesEditorModel): SeriesEditorModel {
  return {
    name: title.title,
    enName: title.originalTitle,
    description: title.description,
    genres: [...title.genres],
    rating: text(title.rating),
    ageRating: text(title.ageRating),
    movieLength: text(title.durationMinutes),
    kpId: title.kpId ?? '',
    posterUrl: title.posterUrl,
    backdropUrl: title.backdropUrl,
    compactPosterUrl: title.compactPosterUrl,
    directors: title.directors.join(', '),
    countries: title.countries.join(', '),
    actors: title.actors.join(', '),
    sequelsAndPrequels: title.sequelsAndPrequels.join(', '),
    similarMovies: title.similarMovies.join(', '),
    addedDate: title.addedDate,
    releaseDate: title.releaseDate ?? '',
    startYear: text(title.series.startYear),
    endYear: text(title.series.endYear),
    productionStatus: title.series.productionStatus,
    announcedSeasonCount: text(title.series.announcedSeasonCount),
    seasons: title.series.seasons.map((season, key) => ({
      isAvailable: season.isAvailable,
      qualityId: season.formats[0]?.qualityId ?? '',
      extensionId: season.formats[0]?.extensionId ?? '',
      key:
        previous?.seasons.find((existing) => existing.seasonNumber === String(season.seasonNumber))?.key ??
        (previous ? Math.max(-1, ...previous.seasons.map((existing) => existing.key)) + 1 + key : key),
      seasonNumber: String(season.seasonNumber),
      releaseYear: text(season.releaseYear),
    })),
  };
}

export function toSeriesDraft(model: SeriesEditorModel): SeriesDraft {
  const startYear = number(model.startYear);
  const endYear = number(model.endYear);
  return {
    kind: 'series',
    title: model.name.trim(),
    originalTitle: model.enName.trim(),
    description: model.description.trim(),
    genres: [...model.genres],
    rating: number(model.rating),
    ageRating: number(model.ageRating),
    durationMinutes: number(model.movieLength),
    kpId: model.kpId.trim() || null,
    posterUrl: model.posterUrl.trim(),
    backdropUrl: model.backdropUrl.trim(),
    compactPosterUrl: model.compactPosterUrl,
    directors: list(model.directors),
    countries: list(model.countries),
    actors: list(model.actors),
    sequelsAndPrequels: list(model.sequelsAndPrequels),
    similarMovies: list(model.similarMovies),
    addedDate: model.addedDate,
    releaseDate: model.releaseDate || null,
    year: startYear === null ? null : endYear === null || endYear === startYear ? startYear : [startYear, endYear],
    formats: seriesSeasonFormats(model.seasons),
    series: {
      startYear,
      endYear,
      productionStatus: model.productionStatus,
      announcedSeasonCount: number(model.announcedSeasonCount),
      seasons: model.seasons.map((season) => ({
        seasonNumber: Number(season.seasonNumber),
        releaseYear: number(season.releaseYear),
        isAvailable: season.isAvailable,
        formats: seasonFormats(season),
      })),
    },
  };
}
function text(value: number | null): string {
  return value === null ? '' : String(value);
}
function number(value: string): number | null {
  return value.trim() ? Number(value) : null;
}
function list(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function seriesSeasonFormats(seasons: readonly SeasonEditorModel[]): readonly TitleFormat[] {
  return seasons
    .flatMap(seasonFormats)
    .filter(
      (format, index, formats) =>
        formats.findIndex((existing) => existing.qualityId === format.qualityId && existing.extensionId === format.extensionId) === index,
    );
}
function seasonFormats(season: SeasonEditorModel): TitleFormat[] {
  return season.isAvailable && season.qualityId && season.extensionId
    ? [{ qualityId: season.qualityId, extensionId: season.extensionId }]
    : [];
}
