import type { Title, SeriesDetails } from './title';
import type { CatalogParams } from './catalog-params';
export const GALLERY_COLLECTIONS = ['movies', 'series', 'wishlist'] as const;
export const GALLERY_KINDS = ['movie', 'series'] as const;
export type GalleryCollection = (typeof GALLERY_COLLECTIONS)[number];
export type GalleryParams = CatalogParams & {
  readonly collections?: readonly GalleryCollection[];
  readonly kinds?: readonly Title['kind'][];
};
export type GalleryItem = Pick<
  Title,
  | 'id'
  | 'kind'
  | 'kpId'
  | 'title'
  | 'originalTitle'
  | 'addedDate'
  | 'year'
  | 'rating'
  | 'ageRating'
  | 'durationMinutes'
  | 'posterUrl'
  | 'compactPosterUrl'
  | 'genres'
  | 'directors'
> & {
  readonly collection: GalleryCollection;
  readonly qualityValues: readonly string[];
  readonly series:
    | (Pick<SeriesDetails, 'startYear' | 'endYear' | 'productionStatus'> & {
        readonly availableSeasonCount: number;
        readonly recordedSeasonCount: number;
      })
    | null;
};
