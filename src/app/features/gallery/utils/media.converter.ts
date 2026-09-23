import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { MediaDto } from '../models/media.dto';
import { Media } from '../models/media';

const formatYear = (year: number | number[]): string => (Array.isArray(year) ? year.join('–') : `${year}`);

export const toMedia = (dto: MediaDto): Media => ({
  id: dto.id,
  title: dto.name || dto.enName,
  originalTitle: dto.enName,
  posterUrl: dto.posterUrl || dto.compactPosterUrl || MEDIA_POSTER_PLACEHOLDER,
  type: dto.isSeries ? 'series' : 'movie',
  quality: dto.quality,
  rating: dto.rating,
  ageRating: `${dto.ageRating}+`,
  year: formatYear(dto.year),
  durationMinutes: dto.movieLength,
  genres: dto.genres,
  director: dto.director.join(', '),
});
