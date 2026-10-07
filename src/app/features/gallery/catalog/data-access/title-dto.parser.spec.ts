import { parseSeriesTitleDto, parseTitleDto, parseTitlesPageDto } from './title-dto.parser';
import { seriesDto, movieTitleDto } from '../testing/title.fixture';

describe('Title API parsing', () => {
  it('preserves incomplete wishlist movies and precision-safe provider IDs', () => {
    expect(parseTitleDto(movieTitleDto)).toEqual(movieTitleDto);
    expect(parseTitleDto(seriesDto).kpId).toBe('9007199254740991');
  });
  it('preserves open-ended series years, season zero, unavailable seasons, and format IDs', () => {
    expect(parseSeriesTitleDto(seriesDto)).toEqual(seriesDto);
  });
  it('rejects a movie returned from the series endpoint', () => {
    expect(() => parseSeriesTitleDto(movieTitleDto)).toThrow(TypeError);
  });
  it.each([
    { kpId: 123 },
    { kpId: '' },
    { kpId: '9007199254740993' },
    { rating: NaN },
    { rating: 11 },
    { movieLength: -1 },
    { ageRating: undefined },
    { releaseDate: '2026-02-30' },
    { year: ['2020'] },
    { kind: 'documentary' },
    { availableSeasonCount: -1 },
    { formats: [{ qualityId: 'q' }] },
    { series: { ...seriesDto.series, productionStatus: 'cancelled' } },
    { series: { ...seriesDto.series, endYear: 2025 } },
    { series: { ...seriesDto.series, seasons: [{ ...seriesDto.series.seasons[0], isAvailable: 'true' }] } },
    { series: { ...seriesDto.series, seasons: [seriesDto.series.seasons[0], seriesDto.series.seasons[0]] } },
  ])('rejects malformed title fields: %j', (fields) => {
    expect(() => parseTitleDto({ ...seriesDto, ...fields })).toThrow(TypeError);
  });
  it.each([
    { currentPage: '0', list: [], totalCount: 0 },
    { currentPage: 0.5, list: [], totalCount: 0 },
    { currentPage: 0, list: null, totalCount: 0 },
    { currentPage: 0, list: [], totalCount: -1 },
  ])('rejects malformed normalized pagination: %j', (value) => {
    expect(() => parseTitlesPageDto(value, parseTitleDto)).toThrow(TypeError);
  });
  it('parses mixed wishlist pages without applying the legacy movie contract', () => {
    const page = { currentPage: 0, list: [seriesDto, movieTitleDto], totalCount: 2 };
    expect(parseTitlesPageDto(page, parseTitleDto)).toEqual(page);
  });
});
