import { seriesYears } from './title-display';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import type { QualitySettingOption } from '@msh-core/settings/settings.dto';
import type { MediaCardModel } from '@msh-shared/components/media-card/media-card.model';
import type { GalleryItem } from '../models/gallery-item';
import type { Title } from '../models/title';
export function galleryCard(
  item: GalleryItem,
  labels: { present: string; unknown: string },
  qualities: readonly QualitySettingOption[] = [],
): MediaCardModel {
  const s = item.series;
  const year = s
    ? seriesYears(s, labels.present, labels.unknown)
    : item.year === null
      ? labels.unknown
      : Array.isArray(item.year)
        ? item.year.map((y) => (y === null ? labels.unknown : y)).join('–')
        : String(item.year);
  return {
    id: item.id,
    title: item.title,
    originalTitle: item.originalTitle,
    type: item.kind,
    year,
    rating: item.rating,
    ageRating: item.ageRating === null ? null : `${item.ageRating}+`,
    durationMinutes: item.durationMinutes,
    genres: item.genres,
    director: item.directors.join(', '),
    posterUrl: item.compactPosterUrl || item.posterUrl || MEDIA_POSTER_PLACEHOLDER,
    quality:
      item.collection === 'wishlist'
        ? null
        : item.qualityValues.map((v) => qualities.find((q) => q.value === v)?.title ?? v).join(', ') || null,
  };
}
export function wishlistSummary(title: Title): GalleryItem {
  return {
    id: title.id,
    kind: title.kind,
    kpId: title.kpId,
    title: title.title,
    originalTitle: title.originalTitle,
    addedDate: title.addedDate,
    year: title.year,
    rating: title.rating,
    ageRating: title.ageRating,
    durationMinutes: title.durationMinutes,
    posterUrl: title.posterUrl,
    compactPosterUrl: title.compactPosterUrl,
    genres: title.genres,
    directors: title.directors,
    collection: 'wishlist',
    qualityValues: [],
    series: title.series
      ? {
          startYear: title.series.startYear,
          endYear: title.series.endYear,
          productionStatus: title.series.productionStatus,
          availableSeasonCount: title.availableSeasonCount ?? 0,
          recordedSeasonCount: title.series.seasons.length,
        }
      : null,
  };
}
export function galleryItemRoute(item: GalleryItem): readonly string[] {
  return ['/gallery', item.collection, item.id];
}
