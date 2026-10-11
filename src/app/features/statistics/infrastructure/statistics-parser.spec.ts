import { parseStatisticsResponse, parseStatisticsScanResponse } from './statistics-parser';
import { emptyStatistics } from '../testing/statistics.fixture';
it('distinguishes never scanned from an empty persisted snapshot', () => {
  expect(parseStatisticsResponse({ snapshot: null })).toBeNull();
  expect(parseStatisticsScanResponse({ snapshot: emptyStatistics })).toEqual(emptyStatistics);
  expect(() => parseStatisticsScanResponse({ snapshot: null })).toThrow();
});
it('rejects invalid response shapes and inconsistent counts rather than casting data', () => {
  for (const raw of [
    null,
    {},
    [],
    { snapshot: { ...emptyStatistics, version: 2 } },
    { snapshot: { ...emptyStatistics, totals: { ...emptyStatistics.totals, movies: 1 } } },
    { snapshot: { ...emptyStatistics, ratings: { ...emptyStatistics.ratings, mean: NaN } } },
  ])
    expect(() => parseStatisticsResponse(raw)).toThrow();
});
