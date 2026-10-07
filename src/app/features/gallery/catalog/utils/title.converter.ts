import type { CollectionPage, CollectionPageDto } from '../../models/collection-page';
import type { SeriesDetails, SeriesDraft, SeriesTitle, Title, TitleDraft } from '../models/title';
import type { SeriesDetailsDto, SeriesTitleDto, SeriesTitleWriteDto, TitleDto, TitleFormatDto, TitleWriteDto } from '../models/title.dto';

export function toTitle(dto: SeriesTitleDto): SeriesTitle;
export function toTitle(dto: TitleDto): Title;
export function toTitle(dto: TitleDto): Title {
  const { name, enName, director, movieLength, ...metadata } = dto;
  const title = {
    ...metadata,
    title: name,
    originalTitle: enName,
    directors: [...director],
    durationMinutes: movieLength,
    actors: [...dto.actors],
    countries: [...dto.countries],
    genres: [...dto.genres],
    sequelsAndPrequels: [...dto.sequelsAndPrequels],
    similarMovies: [...dto.similarMovies],
    year: Array.isArray(dto.year) ? [...dto.year] : dto.year,
    formats: copyFormats(dto.formats),
  };
  return dto.kind === 'series'
    ? { ...title, kind: 'series', series: copySeries(dto.series), availableSeasonCount: dto.availableSeasonCount }
    : { ...title, kind: 'movie', series: null, availableSeasonCount: null };
}

export function toTitleWriteDto(draft: SeriesDraft): SeriesTitleWriteDto;
export function toTitleWriteDto(draft: TitleDraft): TitleWriteDto;
export function toTitleWriteDto(draft: TitleDraft): TitleWriteDto {
  // Explicit fields prevent accidental response-only properties from reaching strict backend validation.
  const metadata = {
    addedDate: draft.addedDate,
    ageRating: draft.ageRating,
    backdropUrl: draft.backdropUrl,
    compactPosterUrl: draft.compactPosterUrl,
    countries: [...draft.countries],
    description: draft.description,
    director: [...draft.directors],
    enName: draft.originalTitle,
    genres: [...draft.genres],
    posterUrl: draft.posterUrl,
    name: draft.title,
    actors: [...draft.actors],
    sequelsAndPrequels: [...draft.sequelsAndPrequels],
    similarMovies: [...draft.similarMovies],
    kpId: draft.kpId,
    year: typeof draft.year === 'object' && draft.year !== null ? [...draft.year] : draft.year,
    movieLength: draft.durationMinutes,
    rating: draft.rating,
    releaseDate: draft.releaseDate,
    formats: copyFormats(draft.formats),
  };
  return draft.kind === 'series'
    ? { ...metadata, kind: 'series', series: copySeries(draft.series) }
    : { ...metadata, kind: 'movie', series: null };
}

export function toTitlesPage<TDto extends TitleDto, TTitle extends Title>(
  dto: CollectionPageDto<TDto>,
  convert: (dto: TDto) => TTitle,
): CollectionPage<TTitle> {
  return { currentPage: Number(dto.currentPage), totalCount: dto.totalCount, media: dto.list.map(convert) };
}

function copySeries(series: SeriesDetails | SeriesDetailsDto): SeriesDetailsDto {
  return {
    startYear: series.startYear,
    endYear: series.endYear,
    productionStatus: series.productionStatus,
    announcedSeasonCount: series.announcedSeasonCount,
    seasons: series.seasons.map((season) => ({
      seasonNumber: season.seasonNumber,
      releaseYear: season.releaseYear,
      isAvailable: season.isAvailable,
      formats: copyFormats(season.formats),
    })),
  };
}

function copyFormats(formats: SeriesDraft['formats']): TitleFormatDto[] {
  return formats.map((format) => ({ qualityId: format.qualityId, extensionId: format.extensionId }));
}
