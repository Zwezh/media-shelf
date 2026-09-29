import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { type MediaDto } from '../models/media.dto';
import { type MovieDetails } from '../models/movie-details';

const formatYear = (year: number | number[]): string => (Array.isArray(year) ? year.join('–') : `${year}`);
const formatAgeRating = (ageRating: unknown): string =>
  typeof ageRating === 'number' && Number.isFinite(ageRating) ? `${ageRating}+` : '--';
const normalizeRelatedTitles = (titles: readonly string[]): string[] =>
  titles.map((title) => title.trim()).filter((title) => title.length > 0);

const toDate = (value: string): Date | null => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day) ? date : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const toMovieDetails = (dto: MediaDto): MovieDetails => ({
  actors: [...dto.actors],
  addedDate: toDate(dto.addedDate),
  ageRating: formatAgeRating(dto.ageRating),
  backdropUrl: dto.backdropUrl,
  countries: [...dto.countries],
  description: dto.description,
  directors: [...dto.director],
  durationMinutes: dto.movieLength,
  extension: dto.extension.trim() || '--',
  genres: [...dto.genres],
  id: dto.id,
  kpId: dto.kpId,
  originalTitle: dto.enName || dto.name,
  posterUrl: dto.posterUrl || dto.compactPosterUrl || MEDIA_POSTER_PLACEHOLDER,
  quality: dto.quality || '--',
  rating: dto.rating,
  sequelsAndPrequels: normalizeRelatedTitles(dto.sequelsAndPrequels),
  similarMovies: normalizeRelatedTitles(dto.similarMovies),
  title: dto.name || dto.enName,
  type: dto.isSeries ? 'series' : 'movie',
  year: formatYear(dto.year),
});
