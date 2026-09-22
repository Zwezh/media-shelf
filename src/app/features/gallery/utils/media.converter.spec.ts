import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { MediaDto } from '../models/media.dto';
import { toMedia } from './media.converter';

const dto: MediaDto = {
  addedDate: '2025-01-01',
  ageRating: 12,
  backdropUrl: '',
  compactPosterUrl: '',
  countries: [],
  description: '',
  director: ['Director'],
  enName: 'Original title',
  extension: 'MKV',
  genres: ['Drama'],
  id: 'movie-1',
  isSeries: false,
  kpId: 1,
  posterUrl: '',
  name: 'Movie title',
  movieLength: 127,
  actors: [],
  quality: '4K',
  rating: 8.4,
  year: [2023, 2024],
  sequelsAndPrequels: [],
  similarMovies: [],
};

describe('toMedia', () => {
  it('maps API data into card-ready media and supplies the poster fallback', () => {
    expect(toMedia(dto)).toMatchObject({
      title: 'Movie title',
      posterUrl: MEDIA_POSTER_PLACEHOLDER,
      duration: '2h 7m',
      year: '2023–2024',
      type: 'movie',
    });
  });

  it('prefers a compact poster when the primary poster is absent', () => {
    expect(toMedia({ ...dto, compactPosterUrl: '/compact.jpg' }).posterUrl).toBe('/compact.jpg');
  });
});
