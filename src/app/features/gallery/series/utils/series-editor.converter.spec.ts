import { toTitleAutofill } from '../../catalog/data-access/title-autofill.parser';
import { titleAutofillDto } from '../../catalog/testing/title-autofill.fixture';
import { mergeTitleAutofill } from '../../catalog/utils/title-autofill';
import { toTitle, toTitleWriteDto } from '../../catalog/utils/title.converter';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { toSeriesDraft, toSeriesEditor } from './series-editor.converter';

describe('Series editor conversion', () => {
  it('preserves nullable metadata, specials, availability and exact format pairs through full writes', () => {
    const title = {
      ...toTitle(seriesDto),
      formats: [
        { qualityId: 'q1', extensionId: 'e1' },
        { qualityId: 'q2', extensionId: 'e2' },
      ],
    };
    const model = toSeriesEditor(title);
    const dto = toTitleWriteDto(toSeriesDraft(model));
    expect(dto.series).toEqual(seriesDto.series);
    expect(dto.formats).toEqual([{ qualityId: 'quality-1', extensionId: 'extension-1' }]);
    expect(dto.kpId).toBe(seriesDto.kpId);
    expect(dto.movieLength).toBeNull();
    expect(dto.rating).toBeNull();
    expect(dto.year).toBe(2020);
    expect(dto).not.toHaveProperty('availableSeasonCount');
    expect(dto).not.toHaveProperty('manualAvailableCount');
    expect(dto).not.toHaveProperty('id');
    expect(dto.series.seasons[0]).not.toHaveProperty('key');
  });
  it('deduplicates title formats from seasons and writes at most one pair per season', () => {
    const model = toSeriesEditor(toTitle(seriesDto));
    const selected = { ...model.seasons[0], qualityId: 'q1', extensionId: 'e1' };
    const draft = toSeriesDraft({ ...model, seasons: [selected, { ...selected, key: 2, seasonNumber: '2' }] });
    expect(draft.formats).toEqual([{ qualityId: 'q1', extensionId: 'e1' }]);
    expect(draft.series.seasons.every((season) => season.formats.length === 1)).toBe(true);
  });
  it('omits unchecked season formats from both season and title writes', () => {
    const model = toSeriesEditor(toTitle(seriesDto));
    const draft = toSeriesDraft({
      ...model,
      seasons: model.seasons.map((season) => ({ ...season, isAvailable: false, qualityId: 'q1', extensionId: 'e1' })),
    });
    expect(draft.formats).toEqual([]);
    expect(draft.series.seasons.every((season) => season.formats.length === 0)).toBe(true);
  });
  it('normalizes text lists and derives a finished range without mutating input', () => {
    const model = {
      ...toSeriesEditor(toTitle(seriesDto)),
      directors: ' A, A\n B ',
      endYear: '2025',
      productionStatus: 'finished' as const,
    };
    const draft = toSeriesDraft(model);
    expect(draft.directors).toEqual(['A', 'B']);
    expect(draft.year).toEqual([2020, 2025]);
    expect(model.directors).toBe(' A, A\n B ');
  });
  it('serializes a series finished in its start year as one year while retaining both bounds', () => {
    const model = {
      ...toSeriesEditor(toTitle(seriesDto)),
      name: '13 клиническая',
      kpId: '4902970',
      startYear: '2022',
      endYear: '2022',
      productionStatus: 'finished' as const,
    };
    const dto = toTitleWriteDto(toSeriesDraft(model));
    expect(dto.year).toBe(2022);
    expect(dto.series).toMatchObject({ startYear: 2022, endYear: 2022, productionStatus: 'finished' });
    expect(dto.series.seasons).toEqual(seriesDto.series.seasons);
    expect(model.endYear).toBe('2022');
  });
  it('preserves season availability, quality and existing row identity across autofill', () => {
    const model = toSeriesEditor(toTitle(seriesDto));
    const latest = { ...model, seasons: model.seasons.map((season) => ({ ...season, key: season.key + 20 })) };
    const filled = toSeriesEditor(toSeriesDraft(latest), latest);
    expect(filled.seasons[0]).toMatchObject({ isAvailable: true, qualityId: 'quality-1', extensionId: 'extension-1' });
    expect(filled.seasons.map((season) => season.key)).toEqual([20, 21]);
  });
  it('fills provider season release years in the editor and write DTO without changing local formats', () => {
    const model = toSeriesEditor(toTitle(seriesDto));
    const draft = toSeriesDraft(model);
    const autofill = toTitleAutofill({
      ...titleAutofillDto,
      series: {
        ...titleAutofillDto.series!,
        seasons: [
          { seasonNumber: 0, releaseYear: 2019 },
          { seasonNumber: 2, releaseYear: 2024 },
        ],
      },
    });
    const filled = toSeriesEditor(mergeTitleAutofill(draft, autofill), model);
    expect(filled.seasons.find((season) => season.seasonNumber === '0')).toMatchObject({
      releaseYear: '2019',
      isAvailable: true,
      qualityId: 'quality-1',
      extensionId: 'extension-1',
      key: model.seasons[0].key,
    });
    expect(filled.seasons.find((season) => season.seasonNumber === '2')).toMatchObject({ releaseYear: '2024', isAvailable: false });
    expect(toTitleWriteDto(toSeriesDraft(filled)).series.seasons).toContainEqual({
      seasonNumber: 2,
      releaseYear: 2024,
      isAvailable: false,
      formats: [],
    });
  });
});
