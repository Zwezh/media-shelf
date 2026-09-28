import { type MediaDto } from '../../models/media.dto';
import { mergeMovieAutofill, toMediaDto, toMovieEditorModel, toStringList } from './movie-editor.converter';

const movie: MediaDto = {
  addedDate: '2025-01-02T10:00:00Z',
  actors: ['Actor One', 'Actor Two'],
  ageRating: 16,
  backdropUrl: '/backdrop.jpg',
  compactPosterUrl: '/compact.jpg',
  countries: ['Russia'],
  description: 'Description',
  director: ['Director'],
  enName: 'Original',
  extension: 'mkv',
  genres: ['Drama'],
  id: 'movie-1',
  isSeries: false,
  kpId: 123,
  movieLength: 120,
  name: 'Название',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8.5,
  sequelsAndPrequels: ['Earlier'],
  similarMovies: ['Similar'],
  year: 2025,
};

describe('movie editor converter', () => {
  it('round-trips a MediaDto through the text-friendly form model', () => {
    const model = toMovieEditorModel(movie);

    expect(model.actors).toBe('Actor One, Actor Two');
    expect(model.addedDate).toBe('2025-01-02');
    expect(toMediaDto(model)).toEqual({ ...movie, addedDate: '2025-01-02' });
  });

  it('normalizes comma and newline separated lists', () => {
    expect(toStringList(' First, Second\nFirst, , Third ')).toEqual(['First', 'Second', 'Third']);
  });

  it('merges autofill without clearing local-only or missing values', () => {
    const model = toMovieEditorModel(movie);
    const result = mergeMovieAutofill(model, {
      actors: [],
      backdropUrl: '',
      compactPosterUrl: '/new-compact.jpg',
      countries: ['USA'],
      description: '',
      directors: ['New Director'],
      enName: 'New original',
      genres: [],
      kpId: 999,
      name: 'Новое название',
      posterUrl: '/new-poster.jpg',
      sequelsAndPrequels: [],
      similarMovies: [],
    });

    expect(result.addedDate).toBe(model.addedDate);
    expect(result.actors).toBe(model.actors);
    expect(result.countries).toBe('USA');
    expect(result.directors).toBe('New Director');
    expect(result.extension).toBe('mkv');
    expect(result.kpId).toBe('999');
    expect(result.quality).toBe('4K');
  });
});
