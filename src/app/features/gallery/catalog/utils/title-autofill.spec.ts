import { Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { AppError } from '@msh-core/http/app-error';
import { AutofillTitleUseCase } from '../application/autofill-title.use-case';
import { TITLE_AUTOFILL_REPOSITORY } from '../application/title-autofill.repository';
import { toTitleAutofill } from '../data-access/title-autofill.parser';
import type { SeriesDraft, TitleDraft } from '../models/title';
import type { TitleAutofill } from '../models/title-autofill';
import { titleAutofillDto } from '../testing/title-autofill.fixture';
import { seriesDraft } from '../testing/title.fixture';
import { toTitleWriteDto } from './title.converter';
import { mergeTitleAutofill } from './title-autofill';

describe('Title autofill merge', () => {
  it('imports metadata but preserves local dates, formats, announced count and season availability', () => {
    const draft = seriesDraft();
    const result = mergeTitleAutofill(draft, toTitleAutofill(titleAutofillDto));
    expect(result).toMatchObject({
      title: 'Imported series',
      kpId: '301',
      ageRating: 0,
      rating: 0,
      durationMinutes: 45,
      releaseDate: '2020-03-15',
      addedDate: draft.addedDate,
      formats: draft.formats,
    });
    expect(result.series.announcedSeasonCount).toBe(3);
    expect(result.series.seasons[0]).toEqual(draft.series.seasons[0]);
    expect(result.series.seasons[1]).toEqual(draft.series.seasons[1]);
    expect(result.series.seasons[2]).toEqual({ seasonNumber: 2, releaseYear: null, isAvailable: false, formats: [] });
    expect(draft.series.seasons).toHaveLength(2);
    const write = toTitleWriteDto(result);
    expect(write.director).toEqual(['Director']);
    expect(write.movieLength).toBe(45);
    expect(write.series.seasons[0].formats).toEqual([{ qualityId: 'quality-1', extensionId: 'extension-1' }]);
    expect(write).not.toHaveProperty('durationMinutes');
  });
  it('autofills season numbers and known years while retaining manual quality and availability', () => {
    const draft = seriesDraft();
    const autofill = toTitleAutofill(titleAutofillDto);
    const result = mergeTitleAutofill(draft, {
      ...autofill,
      series: {
        ...draft.series,
        seasons: [
          { seasonNumber: 0, releaseYear: 2019 },
          { seasonNumber: 2, releaseYear: 2022 },
        ],
      },
    });
    expect(result.series.seasons[0]).toEqual({ ...draft.series.seasons[0], releaseYear: 2019 });
    expect(result.series.seasons[1]).toEqual(draft.series.seasons[1]);
    expect(result.series.seasons[2]).toEqual({ seasonNumber: 2, releaseYear: 2022, isAvailable: false, formats: [] });
  });
  it('retains existing metadata when provider fields are empty or unknown', () => {
    const draft = { ...seriesDraft(), title: 'Manual title', rating: 7, releaseDate: '2025-01-01' };
    const autofill = toTitleAutofill({
      ...titleAutofillDto,
      kind: null,
      name: '',
      rating: null,
      year: null,
      releaseDate: null,
      series: null,
      actors: [],
      directors: [],
      genres: [],
    });
    const result = mergeTitleAutofill(draft, autofill);
    expect(result.title).toBe('Manual title');
    expect(result.rating).toBe(7);
    expect(result.releaseDate).toBe('2025-01-01');
    expect(result.series).toEqual(draft.series);
    expect(mergeTitleAutofill({ ...draft, year: [2020, 2024] }, autofill).year).toEqual([2020, 2024]);
    expect(result.genres).toEqual(draft.genres);
  });
  it('updates production status consistently and preserves seasons absent from the provider list', () => {
    const draft: SeriesDraft = { ...seriesDraft(), series: { ...seriesDraft().series, productionStatus: 'finished', endYear: 2024 } };
    const result = mergeTitleAutofill(draft, toTitleAutofill(titleAutofillDto));
    expect(result.series.productionStatus).toBe('in_production');
    expect(result.series.endYear).toBeNull();
    expect(result.year).toBe(2020);
    const finished = mergeTitleAutofill(
      draft,
      toTitleAutofill({
        ...titleAutofillDto,
        series: { ...titleAutofillDto.series!, productionStatus: 'finished', startYear: 2020, endYear: 2025, seasons: [] },
        year: [2020, 2025],
      }),
    );
    expect(finished.year).toEqual([2020, 2025]);
    expect(finished.series.seasons).toEqual(draft.series.seasons);
  });
  it('rejects mismatched provider kinds without changing the draft', () => {
    const draft = seriesDraft();
    expect(() => mergeTitleAutofill(draft, toTitleAutofill({ ...titleAutofillDto, kind: 'movie', series: null }))).toThrow(AppError);
    expect(draft.kind).toBe('series');
  });
  it('autofills a wishlist movie using its existing kind and format selection', () => {
    const draft: TitleDraft = { ...seriesDraft(), kind: 'movie', series: null };
    const result = mergeTitleAutofill(draft, toTitleAutofill({ ...titleAutofillDto, kind: 'movie', series: null, year: 1999 }));
    expect(result.kind).toBe('movie');
    expect(result.series).toBeNull();
    expect(result.year).toBe(1999);
    expect(result.formats).toEqual(draft.formats);
  });
  it('reads the latest draft after provider completion', () => {
    const response = new Subject<TitleAutofill>();
    TestBed.configureTestingModule({ providers: [{ provide: TITLE_AUTOFILL_REPOSITORY, useValue: { getTitleAutofill: () => response } }] });
    let draft = seriesDraft();
    const result = vi.fn();
    TestBed.inject(AutofillTitleUseCase)
      .execute('301', () => draft)
      .subscribe(result);
    draft = {
      ...draft,
      addedDate: '2026-10-01',
      formats: [{ qualityId: 'latest-quality', extensionId: 'latest-extension' }],
      series: { ...draft.series, announcedSeasonCount: 99 },
    };
    response.next(toTitleAutofill(titleAutofillDto));
    expect(result).toHaveBeenCalledWith(
      expect.objectContaining({
        addedDate: '2026-10-01',
        formats: draft.formats,
        series: expect.objectContaining({ announcedSeasonCount: 99 }),
      }),
    );
  });
});
