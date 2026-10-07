/** Metadata shared by the legacy Movies and normalized title APIs. */
export type MediaMetadataDto = {
  addedDate: string;
  ageRating?: number | null;
  backdropUrl: string;
  compactPosterUrl: string;
  countries: string[];
  description: string;
  director: string[];
  enName: string;
  genres: string[];
  posterUrl: string;
  name: string;
  actors: string[];
  sequelsAndPrequels: string[];
  similarMovies: string[];
};
