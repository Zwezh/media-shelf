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
  if (
    kpId !== null &&
    (typeof kpId !== 'string' || kpId.length > 100 || !/^[1-9]\d*$/.test(kpId) || BigInt(kpId) > BigInt(Number.MAX_SAFE_INTEGER))
  )
    throw invalid('kpId');
  const year =
    r['year'] === null
      ? null
      : Array.isArray(r['year'])
        ? r['year'].map((y: unknown) => (kind === 'series' && y === null ? null : integer(y, 'year', 1, 9999)))
        : integer(r['year'], 'year', 1, 9999);
  let series: GalleryItem['series'] = null;
  if (kind === 'series') {
    const d = asRecord(r['series'], 'series'),
      status = d['productionStatus'];
    if (status !== 'unknown' && status !== 'in_production' && status !== 'finished') throw invalid('productionStatus');
    const startYear = nullableRange(d['startYear'], 'startYear', 1, 9999),
      endYear = nullableRange(d['endYear'], 'endYear', 1, 9999);
    if (endYear !== null && (startYear === null || endYear < startYear || status !== 'finished')) throw invalid('endYear');
    const availableSeasonCount = integer(d['availableSeasonCount'], 'availableSeasonCount', 0, 1000),
      recordedSeasonCount = integer(d['recordedSeasonCount'], 'recordedSeasonCount', 0, 1000);
    if (availableSeasonCount > recordedSeasonCount) throw invalid('availableSeasonCount');
    series = { startYear, endYear, productionStatus: status, availableSeasonCount, recordedSeasonCount };
  } else if (r['series'] !== null) throw invalid('series');
  return {
    id,
    kind,
    collection: collection as GalleryItem['collection'],
    kpId: kpId as string | null,
    title: stringValue(r['name'], 'name'),
    originalTitle: stringValue(r['enName'], 'enName'),
    addedDate: stringValue(r['addedDate'], 'addedDate'),
    year,
    rating: nullableRange(r['rating'], 'rating', 0, 10, false),
    ageRating: nullableRange(r['ageRating'], 'ageRating', 0, 21),
    durationMinutes: nullableRange(r['movieLength'], 'movieLength', 0, 100000),
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
