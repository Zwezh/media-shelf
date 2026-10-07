import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { DeleteSeriesUseCase } from '../application/delete-series.use-case';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import type { SeriesTitle } from '../../catalog/models/title';
import { toTitle } from '../../catalog/utils/title.converter';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { GetSeriesTitleQuery } from '../application/get-series-title.query';
import { SeriesDetailsStore } from './series-details.store';

const title = toTitle(seriesDto);
afterEach(() => TestBed.resetTestingModule());

describe('SeriesDetailsStore', () => {
  it('loads direct links, ignores duplicate IDs, clears stale content and cancels superseded requests', () => {
    const route = new BehaviorSubject(convertToParamMap({ id: title.id }));
    const pending = new Subject<SeriesTitle>();
    const execute = vi
      .fn()
      .mockReturnValueOnce(of(title))
      .mockReturnValueOnce(pending)
      .mockReturnValueOnce(of({ ...title, id: 'third' }));
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: DeleteSeriesUseCase, useValue: { execute: vi.fn(() => of(undefined)) } },
        { provide: GalleryFeedback, useValue: { success: vi.fn(), error: vi.fn() } },
        SeriesDetailsStore,
        { provide: ActivatedRoute, useValue: { paramMap: route } },
        { provide: GetSeriesTitleQuery, useValue: { execute } },
      ],
    });
    const store = TestBed.inject(SeriesDetailsStore);
    expect(store.title()).toEqual(title);
    route.next(convertToParamMap({ id: title.id }));
    expect(execute).toHaveBeenCalledTimes(1);
    route.next(convertToParamMap({ id: 'second' }));
    expect(store.title()).toBeNull();
    expect(store.status()).toBe('loading');
    route.next(convertToParamMap({ id: 'third' }));
    pending.next({ ...title, id: 'second' });
    expect(store.title()?.id).toBe('third');
  });

  it('retries the last requested ID after a failed request', () => {
    const execute = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('not found')))
      .mockReturnValueOnce(of(title));
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: DeleteSeriesUseCase, useValue: { execute: vi.fn(() => of(undefined)) } },
        { provide: GalleryFeedback, useValue: { success: vi.fn(), error: vi.fn() } },
        SeriesDetailsStore,
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: title.id })) } },
        { provide: GetSeriesTitleQuery, useValue: { execute } },
      ],
    });
    const store = TestBed.inject(SeriesDetailsStore);
    expect(store.status()).toBe('error');
    expect(store.title()).toBeNull();
    store.retry();
    expect(execute).toHaveBeenLastCalledWith(title.id);
    expect(store.status()).toBe('loaded');
  });
});

describe('Series details deletion', () => {
  it('retains the current details on failure and returns to the list only after confirmed deletion succeeds', () => {
    const navigate = vi.fn();
    const execute = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValueOnce(of(undefined));
    TestBed.configureTestingModule({
      providers: [
        SeriesDetailsStore,
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: title.id })) } },
        { provide: Router, useValue: { navigate } },
        { provide: GalleryFeedback, useValue: { success: vi.fn(), error: vi.fn() } },
        { provide: GetSeriesTitleQuery, useValue: { execute: () => of(title) } },
        { provide: DeleteSeriesUseCase, useValue: { execute } },
      ],
    });
    const store = TestBed.inject(SeriesDetailsStore);
    store.deleteSeries(title.id);
    expect(store.title()).toEqual(title);
    expect(navigate).not.toHaveBeenCalled();
    expect(store.isDeleting()).toBe(false);
    store.deleteSeries(title.id);
    expect(navigate).toHaveBeenCalledWith(['/gallery/series'], { queryParamsHandling: 'preserve' });
  });
});
