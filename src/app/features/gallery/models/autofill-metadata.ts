import type { MediaMetadataDto } from './media-metadata.dto';

type TextKey = 'backdropUrl' | 'compactPosterUrl' | 'description' | 'enName' | 'name' | 'posterUrl';
type ListKey = 'actors' | 'countries' | 'directors' | 'genres' | 'sequelsAndPrequels' | 'similarMovies';
export type AutofillMetadata = Readonly<Pick<MediaMetadataDto, TextKey>> & Readonly<Record<ListKey, readonly string[]>>;
