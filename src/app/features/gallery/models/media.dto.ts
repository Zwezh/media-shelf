import type { MediaMetadataDto } from './media-metadata.dto';

/** Legacy /movies transport contract; series and wishlist use TitleDto. */
export type MediaDto = MediaMetadataDto & {
  extension: string;
  id: string;
  isSeries: boolean;
  kpId: number;
  movieLength: number;
  quality: string;
  rating: number;
  year: number | number[];
};
