import { toMovieAutofill } from './kinopoisk.converter';

describe('Kinopoisk converter', () => {
  it('maps the complete PoiskKino movie response', () => {
    const result = toMovieAutofill({
      ageRating: 16,
      alternativeName: 'The Matrix',
      backdrop: { previewUrl: '/backdrop-preview.jpg', url: '/backdrop.jpg' },
      countries: [{ name: 'США' }, { name: '' }],
      description: 'Описание',
      genres: [{ name: 'фантастика' }, { name: 'фантастика' }],
      id: 301,
      movieLength: 136,
      name: 'Матрица',
      persons: [
        { enProfession: 'director', name: 'Лана Вачовски' },
        { enName: 'Keanu Reeves', enProfession: 'actor' },
      ],
      poster: { previewUrl: '/poster-preview.jpg', url: '/poster.jpg' },
      rating: { kp: 8.5 },
      sequelsAndPrequels: [{ name: 'Матрица: Перезагрузка' }],
      similarMovies: [{ alternativeName: 'Dark City' }],
      year: 1999,
    });

    expect(result).toEqual({
      actors: ['Keanu Reeves'],
      ageRating: 16,
      backdropUrl: '/backdrop.jpg',
      compactPosterUrl: '/poster-preview.jpg',
      countries: ['США'],
      description: 'Описание',
      directors: ['Лана Вачовски'],
      enName: 'The Matrix',
      genres: ['фантастика'],
      kpId: 301,
      movieLength: 136,
      name: 'Матрица',
      posterUrl: '/poster.jpg',
      rating: 8.5,
      sequelsAndPrequels: ['Матрица: Перезагрузка'],
      similarMovies: ['Dark City'],
      year: 1999,
    });
  });

  it('uses documented fallbacks and tolerates absent optional metadata', () => {
    const result = toMovieAutofill({
      alternativeName: 'Fallback title',
      backdrop: { previewUrl: '/backdrop-preview.jpg' },
      countries: [],
      genres: [],
      id: 42,
      persons: [],
      sequelsAndPrequels: [],
      similarMovies: [],
    });

    expect(result).toMatchObject({
      backdropUrl: '/backdrop-preview.jpg',
      enName: 'Fallback title',
      kpId: 42,
      name: 'Fallback title',
      posterUrl: '',
    });
  });
});
