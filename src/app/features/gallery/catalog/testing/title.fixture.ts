import type { SeriesTitleDto, MovieTitleDto } from '../models/title.dto';
import type { SeriesDraft } from '../models/title';
import { toTitle } from '../utils/title.converter';

export const seriesDto: SeriesTitleDto = {
  id: 'series-1',
  kind: 'series',
  addedDate: '2026-10-05',
  ageRating: null,
  backdropUrl: '',
  compactPosterUrl: '',
  posterUrl: '',
  countries: [],
  description: '',
  director: ['Director'],
  enName: 'Original',
  genres: ['Drama'],
  name: 'Series',
  actors: [],
  sequelsAndPrequels: [],
  similarMovies: [],
  kpId: '9007199254740991',
  year: [2020, null],
  movieLength: null,
  rating: null,
  releaseDate: null,
  formats: [],
  availableSeasonCount: 1,
  series: {
    startYear: 2020,
    endYear: null,
    productionStatus: 'in_production',
    announcedSeasonCount: 3,
    seasons: [
      { seasonNumber: 0, releaseYear: null, isAvailable: true, formats: [{ qualityId: 'quality-1', extensionId: 'extension-1' }] },
      { seasonNumber: 1, releaseYear: 2021, isAvailable: false, formats: [] },
    ],
  },
};
export const movieTitleDto: MovieTitleDto = { ...seriesDto, kind: 'movie', series: null, availableSeasonCount: null, year: null };
export function seriesDraft(): SeriesDraft {
  const { id: _id, availableSeasonCount: _count, ...title } = toTitle(seriesDto);
  return { ...title, year: 2020 };
}
