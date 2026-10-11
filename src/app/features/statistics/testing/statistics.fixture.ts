import type { StatisticsSnapshot } from '../models/statistics-snapshot';
export const emptyStatistics: StatisticsSnapshot = {
  version: 1,
  scannedAt: '2026-10-10T12:00:00.000Z',
  totals: {
    titles: 0,
    movies: 0,
    series: 0,
    movieRuntimeMinutes: 0,
    knownMovieRuntimes: 0,
    recordedSeasons: 0,
    availableSeasons: 0,
    titlesWithoutGenres: 0,
  },
  genres: [],
  qualities: [],
  decades: [],
  unknownYears: 0,
  ratings: {
    bins: Array.from({ length: 10 }, (_, i) => ({ from: i, to: i + 1, count: 0 })),
    knownCount: 0,
    unknownCount: 0,
    mean: null,
    median: null,
    highRatedCount: 0,
  },
};
