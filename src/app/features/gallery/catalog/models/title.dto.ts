import type { MediaMetadataDto } from '../../models/media-metadata.dto';

export type TitleFormatDto = { qualityId: string; extensionId: string };
export type SeriesSeasonDto = {
  seasonNumber: number;
  releaseYear: number | null;
  isAvailable: boolean;
  formats: TitleFormatDto[];
};
export type SeriesDetailsDto = {
  startYear: number | null;
  endYear: number | null;
  productionStatus: 'unknown' | 'in_production' | 'finished';
  announcedSeasonCount: number | null;
  seasons: SeriesSeasonDto[];
};

type TitleMetadataDto = Omit<MediaMetadataDto, 'ageRating'> & {
  ageRating: number | null;
  kpId: string | null;
  year: number | (number | null)[] | null;
  movieLength: number | null;
  rating: number | null;
  releaseDate: string | null;
  formats: TitleFormatDto[];
  id: string;
};

export type SeriesTitleDto = TitleMetadataDto & {
  kind: 'series';
  series: SeriesDetailsDto;
  availableSeasonCount: number;
};
export type MovieTitleDto = TitleMetadataDto & {
  kind: 'movie';
  series: null;
  availableSeasonCount: null;
};
export type TitleDto = MovieTitleDto | SeriesTitleDto;

type TitleWriteMetadataDto = Omit<TitleMetadataDto, 'id' | 'year'> & { year: number | number[] | null };
export type SeriesTitleWriteDto = TitleWriteMetadataDto & Pick<SeriesTitleDto, 'kind' | 'series'>;
export type TitleWriteDto = SeriesTitleWriteDto | (TitleWriteMetadataDto & Pick<MovieTitleDto, 'kind' | 'series'>);
