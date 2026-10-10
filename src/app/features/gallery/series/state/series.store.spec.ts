import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { DeleteSeriesUseCase } from '../application/delete-series.use-case';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, type Observable, of, Subject, throwError } from 'rxjs';
import type { CollectionPage } from '../../models/collection-page';
import type { SeriesTitle } from '../../catalog/models/title';
import { DEFAULT_MOVIES_PARAMS } from '../../utils/movies-params';
import { DEFAULT_CATALOG_PARAMS } from '../../catalog/models/catalog-params';
import { toTitle } from '../../catalog/utils/title.converter';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { GetSeriesQuery } from '../application/get-series.query';
import { readCatalogParams, CatalogRouteState } from '../../catalog/state/catalog-route-state';
import { SeriesStore } from './series.store';

const title = toTitle(seriesDto);
const page = { media: [title], totalCount: 100, currentPage: 0 };

function setup(response: Observable<CollectionPage<SeriesTitle>> = of(page), params: Record<string, unknown> = {}) {
  const route = new BehaviorSubject(convertToParamMap(params));
  const execute = vi.fn(() => response);
  const navigate = vi.fn(() => Promise.resolve(true));
  TestBed.configureTestingModule({
    providers: [
      { provide: DeleteSeriesUseCase, useValue: { execute: vi.fn(() => of(undefined)) } },
      { provide: GalleryFeedback, useValue: { success: vi.fn(), error: vi.fn() } },
      SeriesStore,
      CatalogRouteState,
      { provide: GetSeriesQuery, useValue: { execute } },
      { provide: ActivatedRoute, useValue: { queryParamMap: route } },
      { provide: Router, useValue: { navigate } },
    ],
  });
  return { store: TestBed.inject(SeriesStore), execute, navigate, route };
}

afterEach(() => TestBed.resetTestingModule());

describe('Series URL and store', () => {
  it('uses Catalog defaults and rejects unsupported quality sorting without losing filters', () => {
    expect(readCatalogParams(convertToParamMap({}))).toEqual(DEFAULT_CATALOG_PARAMS);
    expect(readCatalogParams(convertToParamMap({})).pageSize).toBe(30);
    expect(readCatalogParams(convertToParamMap({}))).toMatchObject({
      key: DEFAULT_MOVIES_PARAMS.key,
      direction: DEFAULT_MOVIES_PARAMS.direction,
    });
    expect(
      readCatalogParams(
        convertToParamMap({
          key: 'quality',
          direction: 'desc',
          pageSize: '999',
          currentPage: '-1',
          search: '  Test ',
          genres: ['Drama', 'Drama'],
        }),
      ),
    ).toEqual({ ...DEFAULT_CATALOG_PARAMS, direction: 'desc', pageSize: 100, search: 'Test', genres: ['Drama'] });
    expect(readCatalogParams(convertToParamMap({ key: 'movieLength' })).key).toBe('movieLength');
    expect(readCatalogParams(convertToParamMap({ key: 'kpId' })).key).toBe('kpId');
  });

  it('loads once per distinct URL and lets URL emissions own filter/sort/page requests', () => {
    const { store, execute, navigate, route } = setup(of(page), { currentPage: '2', search: 'Test' });
    expect(store.page()).toBe(3);
    expect(store.status()).toBe('loaded');
    store.applyFilters({ genres: ['Drama'] });
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ queryParams: { ...DEFAULT_CATALOG_PARAMS, search: 'Test', genres: ['Drama'] } }),
    );
    expect(execute).toHaveBeenCalledTimes(1);
    route.next(convertToParamMap({ currentPage: '2', search: 'Test' }));
    expect(execute).toHaveBeenCalledTimes(1);
    route.next(convertToParamMap({ search: 'Test', genres: ['Drama'] }));
    expect(execute).toHaveBeenCalledTimes(2);
    store.applySorting({ key: 'rating', direction: 'desc' });
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ search: 'Test', genres: ['Drama'], key: 'rating', direction: 'desc', currentPage: 0 }),
      }),
    );
    store.changePage(2);
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: expect.objectContaining({ currentPage: 1 }) }));
    store.clearFilters();
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: { ...DEFAULT_CATALOG_PARAMS, search: 'Test' } }));
  });

  it('cancels stale requests and destroys route subscriptions with the scoped store', () => {
    const first = new Subject<CollectionPage<SeriesTitle>>();
    const second = new Subject<CollectionPage<SeriesTitle>>();
    const { store, execute, route } = setup(first);
    execute.mockReturnValueOnce(second);
    route.next(convertToParamMap({ search: 'Next' }));
    first.next(page);
    expect(store.status()).toBe('loading');
    second.next({ ...page, media: [], totalCount: 0 });
    expect(store.status()).toBe('loaded');
    expect(store.titles()).toEqual([]);
    TestBed.resetTestingModule();
    route.next(convertToParamMap({ search: 'After destroy' }));
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('offers retry after a failure and corrects oversized pages by replacement navigation', () => {
    const { store, execute, navigate } = setup(
      throwError(() => new Error('offline')),
      { currentPage: '9' },
    );
    expect(store.status()).toBe('error');
    expect(store.titles()).toEqual([]);
    execute.mockReturnValueOnce(of({ ...page, totalCount: DEFAULT_PAGE_SIZE + 1 }));
    store.retry();
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ replaceUrl: true, queryParams: expect.objectContaining({ currentPage: 1 }) }),
    );
  });
});

describe('Series list deletion', () => {
  it('ignores duplicate delete commands and removes a title only after success', () => {
    const { store } = setup();
    const pending = new Subject<void>();
    const deletion = vi.spyOn(TestBed.inject(DeleteSeriesUseCase), 'execute').mockReturnValue(pending);
    store.deleteSeries(title.id);
    store.deleteSeries(title.id);
    expect(deletion).toHaveBeenCalledOnce();
    expect(store.titles()).toHaveLength(1);
    expect(store.isDeleting()).toBe(true);
    pending.next();
    expect(store.titles()).toEqual([]);
    expect(store.totalCount()).toBe(99);
    expect(store.isDeleting()).toBe(false);
  });
  it('retains list data on failure and navigates the canonical URL when the last row of a later page is deleted', () => {
    const { store, navigate } = setup(of({ ...page, totalCount: DEFAULT_PAGE_SIZE + 1 }), { currentPage: '1' });
    const deletion = vi
      .spyOn(TestBed.inject(DeleteSeriesUseCase), 'execute')
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValueOnce(of(undefined));
    store.deleteSeries(title.id);
    expect(store.titles()).toHaveLength(1);
    expect(store.totalCount()).toBe(DEFAULT_PAGE_SIZE + 1);
    expect(store.isDeleting()).toBe(false);
    store.deleteSeries(title.id);
    expect(deletion).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ replaceUrl: true, queryParams: expect.objectContaining({ currentPage: 0 }) }),
    );
  });
  it('cancels an overlapping read so it cannot restore a deleted title', () => {
    const { store, execute, route } = setup();
    const stale = new Subject<CollectionPage<SeriesTitle>>();
    execute.mockReturnValueOnce(stale).mockReturnValueOnce(of({ ...page, media: [], totalCount: 99 }));
    route.next(convertToParamMap({ search: 'Other' }));
    store.deleteSeries(title.id);
    stale.next(page);
    expect(store.titles()).toEqual([]);
    expect(store.status()).toBe('loaded');
  });
});
