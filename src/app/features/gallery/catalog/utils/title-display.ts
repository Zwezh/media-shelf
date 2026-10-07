import type { ExtensionSettingOption, QualitySettingOption } from '@msh-core/settings/settings.dto';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import type { MediaCardModel } from '@msh-shared/components/media-card/media-card.model';
import type { SeriesDetails, SeriesSeason, SeriesTitle, TitleFormat } from '../models/title';
import type { TitleDetailsView } from '../models/title-details-view';

export function seriesYears(series: SeriesDetails, present: string, unknown: string): string {
  if (series.startYear === null) return unknown;
  if (series.endYear !== null)
    return series.startYear === series.endYear ? String(series.startYear) : `${series.startYear}–${series.endYear}`;
  return series.productionStatus === 'in_production' ? `${series.startYear}–${present}` : String(series.startYear);
}

export function formatLabels(
  formats: readonly TitleFormat[],
  qualities: readonly QualitySettingOption[],
  extensions: readonly ExtensionSettingOption[],
  unknown: string,
): readonly string[] {
  return formats.map(
    (format) =>
      `${qualities.find((option) => option.id === format.qualityId)?.title ?? unknown} · ${extensions.find((option) => option.id === format.extensionId)?.value ?? unknown}`,
  );
}

export function toSeriesCard(title: SeriesTitle, qualities: readonly QualitySettingOption[], year: string): MediaCardModel {
  const formats = availableSeasonFormats(title.series.seasons);
  const labels = [
    ...new Set(
      formats.flatMap((format) => {
        const option = qualities.find((quality) => quality.id === format.qualityId);
        return option ? [option.title] : [];
      }),
    ),
  ];
  return {
    id: title.id,
    title: title.title,
    originalTitle: title.originalTitle,
    type: 'series',
    year,
    ageRating: title.ageRating === null ? null : `${title.ageRating}+`,
    rating: title.rating,
    durationMinutes: title.durationMinutes,
    director: title.directors.join(', '),
    genres: title.genres,
    posterUrl: title.compactPosterUrl || title.posterUrl || MEDIA_POSTER_PLACEHOLDER,
    quality: labels.join(', ') || null,
  };
}

export function toSeriesDetailsView(title: SeriesTitle, qualities: readonly QualitySettingOption[], year: string): TitleDetailsView {
  const card = toSeriesCard(title, qualities, year);
  const addedDate = new Date(title.addedDate);
  return {
    ...card,
    posterUrl: title.posterUrl || MEDIA_POSTER_PLACEHOLDER,
    addedDate: Number.isNaN(addedDate.getTime()) ? null : addedDate,
    backdropUrl: title.backdropUrl,
    countries: title.countries,
    description: title.description,
    directors: title.directors,
    kpId: title.kpId,
    sequelsAndPrequels: title.sequelsAndPrequels,
    similarMovies: title.similarMovies,
    actors: title.actors,
  };
}

export function availableSeasonFormats(seasons: readonly SeriesSeason[]): readonly TitleFormat[] {
  return seasons
    .filter((season) => season.isAvailable)
    .flatMap((season) => season.formats)
    .filter(
      (format, index, formats) =>
        formats.findIndex((existing) => existing.qualityId === format.qualityId && existing.extensionId === format.extensionId) === index,
    );
}
