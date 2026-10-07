import type { TitleAutofillDto } from '../models/title-autofill.dto';

/** Normalized response corresponding to the backend's series-provider mapping fixture. */
export const titleAutofillDto: TitleAutofillDto = {
  actors: ['Actor'],
  ageRating: 0,
  backdropUrl: '',
  compactPosterUrl: '',
  countries: [],
  description: '',
  directors: ['Director'],
  enName: 'Original series',
  genres: ['Drama'],
  kpId: '301',
  movieLength: 45,
  name: 'Imported series',
  posterUrl: '',
  rating: 0,
  sequelsAndPrequels: [],
  similarMovies: [],
  kind: 'series',
  year: 2020,
  releaseDate: '2020-03-15',
  series: {
    startYear: 2020,
    endYear: null,
    productionStatus: 'in_production',
    announcedSeasonCount: null,
    seasons: [0, 1, 2].map((seasonNumber) => ({ seasonNumber, releaseYear: null })),
  },
};
