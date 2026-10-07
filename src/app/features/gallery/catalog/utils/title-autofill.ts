import { AppError } from '@msh-core/http/app-error';
import type { SeriesDetails, SeriesDraft, TitleDraft } from '../models/title';
import type { SeriesAutofill, TitleAutofill } from '../models/title-autofill';

export function mergeTitleAutofill(draft: SeriesDraft, autofill: TitleAutofill): SeriesDraft;
export function mergeTitleAutofill(draft: TitleDraft, autofill: TitleAutofill): TitleDraft;
export function mergeTitleAutofill(draft: TitleDraft, autofill: TitleAutofill): TitleDraft {
  if (autofill.kind !== null && autofill.kind !== draft.kind)
    throw new AppError('validation', 'The provider title kind does not match the draft.');
  const metadata = {
    ...draft,
    kpId: autofill.kpId,
    title: autofill.title || draft.title,
    originalTitle: autofill.originalTitle || draft.originalTitle,
    description: autofill.description || draft.description,
    backdropUrl: autofill.backdropUrl || draft.backdropUrl,
    compactPosterUrl: autofill.compactPosterUrl || draft.compactPosterUrl,
    posterUrl: autofill.posterUrl || draft.posterUrl,
    actors: copyOrExisting(autofill.actors, draft.actors),
    directors: copyOrExisting(autofill.directors, draft.directors),
    countries: copyOrExisting(autofill.countries, draft.countries),
    genres: copyOrExisting(autofill.genres, draft.genres),
    sequelsAndPrequels: copyOrExisting(autofill.sequelsAndPrequels, draft.sequelsAndPrequels),
    similarMovies: copyOrExisting(autofill.similarMovies, draft.similarMovies),
    ageRating: autofill.ageRating ?? draft.ageRating,
    rating: autofill.rating ?? draft.rating,
    durationMinutes: autofill.durationMinutes ?? draft.durationMinutes,
    year: autofill.year ?? draft.year,
    releaseDate: autofill.releaseDate ?? draft.releaseDate,
  };
  if (draft.kind === 'movie') return { ...metadata, kind: 'movie', series: null };
  const series = autofill.series ? mergeSeriesAutofill(draft.series, autofill.series) : draft.series;
  const hasSeriesYearUpdate =
    autofill.series !== null &&
    (autofill.series.startYear !== null || autofill.series.endYear !== null || autofill.series.productionStatus !== 'unknown');
  const year =
    !hasSeriesYearUpdate || series.startYear === null
      ? metadata.year
      : series.endYear === null || series.endYear === series.startYear
        ? series.startYear
        : [series.startYear, series.endYear];
  return { ...metadata, kind: 'series', series, year };
}

function mergeSeriesAutofill(draft: SeriesDetails, autofill: SeriesAutofill): SeriesDetails {
  const productionStatus = autofill.productionStatus === 'unknown' ? draft.productionStatus : autofill.productionStatus;
  const startYear = autofill.startYear ?? draft.startYear;
  const candidateEnd = autofill.endYear ?? draft.endYear;
  const endYear =
    productionStatus === 'finished' && startYear !== null && candidateEnd !== null && candidateEnd >= startYear ? candidateEnd : null;
  const seasons = new Map(
    draft.seasons.map((season) => [season.seasonNumber, { ...season, formats: season.formats.map((format) => ({ ...format })) }]),
  );
  for (const season of autofill.seasons) {
    const existing = seasons.get(season.seasonNumber);
    seasons.set(
      season.seasonNumber,
      existing ? { ...existing, releaseYear: season.releaseYear ?? existing.releaseYear } : { ...season, isAvailable: false, formats: [] },
    );
  }
  return {
    startYear,
    endYear,
    productionStatus,
    announcedSeasonCount: autofill.announcedSeasonCount ?? draft.announcedSeasonCount,
    seasons: [...seasons.values()].sort((a, b) => a.seasonNumber - b.seasonNumber),
  };
}

function copyOrExisting(incoming: readonly string[], existing: readonly string[]): readonly string[] {
  return [...(incoming.length ? incoming : existing)];
}
