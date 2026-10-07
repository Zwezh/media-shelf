import { seriesDto, seriesDraft } from '../testing/title.fixture';
import { toTitle, toTitleWriteDto } from './title.converter';

describe('Title conversion', () => {
  it('maps domain names without formatting or losing unknown metadata', () => {
    const title = toTitle(seriesDto);
    expect(title).toMatchObject({
      title: 'Series',
      originalTitle: 'Original',
      directors: ['Director'],
      durationMinutes: null,
      year: [2020, null],
      rating: null,
    });
    expect(title).not.toHaveProperty('name');
    expect(title).not.toHaveProperty('movieLength');
  });
  it('copies nested data so presentation changes cannot mutate the transport response', () => {
    const title = toTitle(seriesDto);
    expect(title.directors).not.toBe(seriesDto.director);
    expect(title.year).not.toBe(seriesDto.year);
    expect(title.series).not.toBe(seriesDto.series);
    expect(title.series.seasons[0].formats[0]).not.toBe(seriesDto.series.seasons[0].formats[0]);
  });
  it('writes explicit transport fields and excludes read-only data even when supplied structurally', () => {
    const seed = seriesDraft();
    const widerDraft = {
      ...seed,
      id: 'ignored',
      availableSeasonCount: 99,
      series: {
        ...seed.series,
        uiExpanded: true,
        seasons: seed.series.seasons.map((season) => ({
          ...season,
          id: 'season-ui-id',
          formats: season.formats.map((format) => ({ ...format, label: 'UI label' })),
        })),
      },
    };
    const dto = toTitleWriteDto(widerDraft);
    expect(dto).not.toHaveProperty('id');
    expect(dto).not.toHaveProperty('availableSeasonCount');
    expect(dto).not.toHaveProperty('title');
    expect(dto.series).not.toHaveProperty('uiExpanded');
    expect(dto.series.seasons[0]).not.toHaveProperty('id');
    expect(dto).toMatchObject({
      name: 'Series',
      enName: 'Original',
      director: ['Director'],
      movieLength: null,
      kpId: '9007199254740991',
      kind: 'series',
      year: 2020,
    });
    expect(dto.series.seasons[0].formats).toEqual([{ qualityId: 'quality-1', extensionId: 'extension-1' }]);
  });
});
