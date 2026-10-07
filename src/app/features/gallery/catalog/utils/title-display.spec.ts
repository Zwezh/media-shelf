import { toTitle } from './title.converter';
import { seriesDto } from '../testing/title.fixture';
import { availableSeasonFormats, formatLabels, seriesYears, toSeriesCard, toSeriesDetailsView } from './title-display';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';

const title = toTitle(seriesDto);
const qualities = [{ id: 'quality-1', title: '4K', value: '2160p' }];
const extensions = [{ id: 'extension-1', value: 'mkv' }];

describe('Series display', () => {
  it('distinguishes known, ongoing and unknown years without guessing status', () => {
    expect(seriesYears(title.series, 'present', 'Unknown')).toBe('2020–present');
    expect(seriesYears({ ...title.series, productionStatus: 'unknown' }, 'present', 'Unknown')).toBe('2020');
    expect(seriesYears({ ...title.series, productionStatus: 'finished', endYear: 2023 }, 'present', 'Unknown')).toBe('2020–2023');
    expect(seriesYears({ ...title.series, productionStatus: 'finished', endYear: 2020 }, 'present', 'Unknown')).toBe('2020');
    expect(seriesYears({ ...title.series, startYear: null }, 'present', 'Unknown')).toBe('Unknown');
  });

  it('preserves nullable metadata and resolves only known available quality IDs', () => {
    const card = toSeriesCard(title, qualities, '2020–present');
    expect(card).toMatchObject({
      type: 'series',
      ageRating: null,
      rating: null,
      durationMinutes: null,
      quality: '4K',
      posterUrl: MEDIA_POSTER_PLACEHOLDER,
    });
    expect(toSeriesCard(title, [], '2020').quality).toBeNull();
    expect(toSeriesCard({ ...title, rating: 0, ageRating: 0 }, qualities, '2020')).toMatchObject({ rating: 0, ageRating: '0+' });
    expect(
      toSeriesCard(
        { ...title, series: { ...title.series, seasons: title.series.seasons.map((season) => ({ ...season, isAvailable: false })) } },
        qualities,
        '2020',
      ).quality,
    ).toBeNull();
  });

  it('ignores unavailable season formats and stale title-level formats in view mode', () => {
    const unavailable = {
      ...title,
      formats: title.series.seasons[0].formats,
      series: {
        ...title.series,
        seasons: title.series.seasons.map((season) => ({ ...season, isAvailable: false, formats: title.series.seasons[0].formats })),
      },
    };
    expect(availableSeasonFormats(unavailable.series.seasons)).toEqual([]);
    expect(toSeriesCard(unavailable, qualities, '2020').quality).toBeNull();
    expect(toSeriesDetailsView(unavailable, qualities, '2020').quality).toBeNull();
  });
  it('keeps provider IDs as strings, prefers full artwork for details and represents every format pair', () => {
    const view = toSeriesDetailsView({ ...title, compactPosterUrl: '/compact.jpg', posterUrl: '/poster.jpg' }, qualities, '2020');
    expect(view.kpId).toBe('9007199254740991');
    expect(view.posterUrl).toBe('/poster.jpg');
    expect(formatLabels(title.series.seasons[0].formats, qualities, extensions, 'Unknown')).toEqual(['4K · mkv']);
    expect(formatLabels(title.series.seasons[0].formats, [], [], 'Unknown')).toEqual(['Unknown · Unknown']);
  });
});
