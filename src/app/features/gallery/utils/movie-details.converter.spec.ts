import { type MediaDto } from '../models/media.dto';
import { toMovieDetails } from './movie-details.converter';

const dto: MediaDto = {
  actors: ['Actor One', 'Actor Two'],
  addedDate: '2025-01-02T12:00:00Z',
  ageRating: 12,
  backdropUrl: '/backdrop.jpg',
  compactPosterUrl: '/compact.jpg',
  countries: ['United States'],
  description: 'Description',
  director: ['Director'],
  enName: 'Original title',
  extension: 'mkv',
  genres: ['Drama'],
  id: 'movie-1',
  isSeries: false,
  kpId: 258687,
  movieLength: 169,
  name: 'Movie title',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8.7,
  sequelsAndPrequels: ['Prequel'],
  similarMovies: ['Similar movie'],
  year: [2024, 2025],
};

describe('toMovieDetails', () => {
  it('creates a detail-ready model and copies collection fields', () => {
    const details = toMovieDetails(dto);

    expect(details).toEqual(
      expect.objectContaining({
        actors: ['Actor One', 'Actor Two'],
        ageRating: '12+',
        kpId: 258687,
        posterUrl: '/poster.jpg',
        title: 'Movie title',
        year: '2024–2025',
      }),
    );
    expect(details.addedDate?.toISOString()).toBe('2025-01-02T12:00:00.000Z');

    dto.actors.push('Late mutation');
    dto.similarMovies.push('Late mutation');
    expect(details.actors).toEqual(['Actor One', 'Actor Two']);
    expect(details.similarMovies).toEqual(['Similar movie']);
  });

  it('normalizes missing presentation values and invalid dates', () => {
    const details = toMovieDetails({
      ...dto,
      addedDate: 'not-a-date',
      ageRating: null,
      compactPosterUrl: '',
      enName: 'Fallback title',
      extension: ' ',
      name: '',
      posterUrl: '',
      quality: '',
      sequelsAndPrequels: ['', '  Prequel  ', '   '],
      similarMovies: ['', '  Similar movie  '],
      year: 2024,
    });

    expect(details.addedDate).toBeNull();
    expect(details.ageRating).toBe('--');
    expect(details.extension).toBe('--');
    expect(details.posterUrl).toBe('/poster-placeholder.svg');
    expect(details.quality).toBe('--');
    expect(details.sequelsAndPrequels).toEqual(['Prequel']);
    expect(details.similarMovies).toEqual(['Similar movie']);
    expect(details.title).toBe('Fallback title');
    expect(details.year).toBe('2024');
  });

  it('parses a date-only value as a local calendar date', () => {
    const addedDate = toMovieDetails({ ...dto, addedDate: '2025-01-02' }).addedDate;

    expect(addedDate?.getFullYear()).toBe(2025);
    expect(addedDate?.getMonth()).toBe(0);
    expect(addedDate?.getDate()).toBe(2);
    expect(addedDate?.getHours()).toBe(0);
  });
});
