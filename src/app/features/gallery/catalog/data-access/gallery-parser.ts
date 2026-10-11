import { MEDIA_LIMITS } from '../../models/media-limits';
import { isProviderId } from '../../utils/provider-id';
import { asRecord, invalid, stringArray, stringValue } from '../../data-access/dto-values';
import { integer, nullableRange } from './title-values';
import type { CollectionPage } from '../../models/collection-page';
import { GALLERY_COLLECTIONS, type GalleryItem } from '../models/gallery-item';
export function parseGalleryItem(value: unknown): GalleryItem {
  const r = asRecord(value, 'gallery item');
  const kind = r['kind'],
    collection = r['collection'];
  if (kind !== 'movie' && kind !== 'series') throw invalid('kind');
  if (
    !GALLERY_COLLECTIONS.some((c) => c === collection) ||
    (collection === 'movies' && kind !== 'movie') ||
    (collection === 'series' && kind !== 'series')
  )
    throw invalid('collection');
  const id = stringValue(r['id'], 'id');
  if (!id.trim()) throw invalid('id');
  const kpId = r['kpId'];
  if (kpId !== null && !isProviderId(kpId)) throw invalid('kpId');
  const year =
    r['year'] === null
      ? null
      : Array.isArray(r['year'])
        ? r['year'].map((y: unknown) =>
            kind === 'series' && y === null ? null : integer(y, 'year', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear),
          )
        : integer(r['year'], 'year', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear);
  let series: GalleryItem['series'] = null;
  if (kind === 'series') {
    const d = asRecord(r['series'], 'series'),
      status = d['productionStatus'];
    if (status !== 'unknown' && status !== 'in_production' && status !== 'finished') throw invalid('productionStatus');
    const startYear = nullableRange(d['startYear'], 'startYear', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear),
      endYear = nullableRange(d['endYear'], 'endYear', MEDIA_LIMITS.minYear, MEDIA_LIMITS.maxYear);
    if (endYear !== null && (startYear === null || endYear < startYear || status !== 'finished')) throw invalid('endYear');
    const availableSeasonCount = integer(d['availableSeasonCount'], 'availableSeasonCount', 0, MEDIA_LIMITS.maxSeasons),
      recordedSeasonCount = integer(d['recordedSeasonCount'], 'recordedSeasonCount', 0, MEDIA_LIMITS.maxSeasons);
    if (availableSeasonCount > recordedSeasonCount) throw invalid('availableSeasonCount');
    series = { startYear, endYear, productionStatus: status, availableSeasonCount, recordedSeasonCount };
  } else if (r['series'] !== null) throw invalid('series');
  return {
    id,
    kind,
    collection: collection as GalleryItem['collection'],
    kpId,
    title: stringValue(r['name'], 'name'),
    originalTitle: stringValue(r['enName'], 'enName'),
    addedDate: stringValue(r['addedDate'], 'addedDate'),
    year,
    rating: nullableRange(r['rating'], 'rating', 0, MEDIA_LIMITS.maxRating, false),
    ageRating: nullableRange(r['ageRating'], 'ageRating', 0, MEDIA_LIMITS.maxAgeRating),
    durationMinutes: nullableRange(r['movieLength'], 'movieLength', 0, MEDIA_LIMITS.maxRuntimeMinutes),
    posterUrl: stringValue(r['posterUrl'], 'posterUrl'),
    compactPosterUrl: stringValue(r['compactPosterUrl'], 'compactPosterUrl'),
    genres: stringArray(r['genres'], 'genres'),
    directors: stringArray(r['director'], 'director'),
    qualityValues: stringArray(r['qualityValues'], 'qualityValues'),
    series,
  };
}
export function parseGalleryPage(value: unknown): CollectionPage<GalleryItem> {
  const r = asRecord(value, 'gallery page');
  if (!Array.isArray(r['list'])) throw invalid('list');
  return {
    media: r['list'].map(parseGalleryItem),
    currentPage: integer(r['currentPage'], 'currentPage', 0, Number.MAX_SAFE_INTEGER),
    totalCount: integer(r['totalCount'], 'totalCount', 0, Number.MAX_SAFE_INTEGER),
  };
}
