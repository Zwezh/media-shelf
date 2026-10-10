import type { ExtensionSettingOption, QualitySettingOption } from '@msh-core/settings/settings.dto';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import type { MediaCardModel } from '@msh-shared/components/media-card/media-card.model';
import type { SeriesDetails, SeriesSeason, SeriesTitle, TitleFormat, Title } from '../models/title';
import type { TitleDetailsView } from '../models/title-details-view';

type TitleDisplayLabels = { readonly present: string; readonly unknown: string };

export function seriesYears(
  series: Pick<SeriesDetails, 'startYear' | 'endYear' | 'productionStatus'>,
  present: string,
  unknown: string,
): string {
  if (series.startYear === null) return unknown;
  if (series.endYear !== null)
    return series.startYear === series.endYear ? String(series.startYear) : `${series.startYear}–${series.endYear}`;
  return series.productionStatus === 'in_production' ? `${series.startYear}–${present}` : String(series.startYear);
}

export function toTitleCard(title: Title, labels: TitleDisplayLabels): MediaCardModel {
  const year =
    title.kind === 'series'
      ? seriesYears(title.series, labels.present, labels.unknown)
      : title.year === null
        ? labels.unknown
        : typeof title.year === 'number'
          ? String(title.year)
          : title.year.map((year) => (year === null ? labels.unknown : String(year))).join('–');
  return {
    id: title.id,
    title: title.title,
    originalTitle: title.originalTitle,
    type: title.kind,
    year,
    ageRating: title.ageRating === null ? null : `${title.ageRating}+`,
    rating: title.rating,
    durationMinutes: title.durationMinutes,
    director: title.directors.join(', '),
    genres: title.genres,
    posterUrl: title.compactPosterUrl || title.posterUrl || MEDIA_POSTER_PLACEHOLDER,
  };
}

export function toTitleDetailsView(title: Title, labels: TitleDisplayLabels): TitleDetailsView {
  return {
    ...toTitleCard(title, labels),
    posterUrl: title.posterUrl || MEDIA_POSTER_PLACEHOLDER,
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
  const quality =
    [
      ...new Set(
        availableSeasonFormats(title.series.seasons).flatMap((format) => {
          const option = qualities.find((quality) => quality.id === format.qualityId);
          return option ? [option.title] : [];
        }),
      ),
    ].join(', ') || null;
  return { ...toTitleCard(title, { present: '', unknown: '' }), year, quality };
}

export function toSeriesDetailsView(title: SeriesTitle, qualities: readonly QualitySettingOption[], year: string): TitleDetailsView {
  const addedDate = new Date(title.addedDate);
  return {
    ...toTitleDetailsView(title, { present: '', unknown: '' }),
    year,
    quality: toSeriesCard(title, qualities, year).quality,
    addedDate: Number.isNaN(addedDate.getTime()) ? null : addedDate,
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
