import { RefreshWishlistUseCase } from '../application/refresh-wishlist.use-case';
import { DeleteWishlistUseCase } from '../application/delete-wishlist.use-case';
import { WISHLIST_MUTATION_TEST_PROVIDERS } from '@msh/testing/wishlist-testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { CatalogRouteState } from '../../catalog/state/catalog-route-state';
import { movieTitleDto, seriesDto } from '../../catalog/testing/title.fixture';
import { toTitle } from '../../catalog/utils/title.converter';
import type { Title } from '../../catalog/models/title';
import type { CollectionPage } from '../../models/collection-page';
import { GetWishlistQuery } from '../application/get-wishlist.query';
import { GetWishlistTitleQuery } from '../application/get-wishlist-title.query';
import { WishlistStore } from './wishlist.store';
import { WishlistDetailsStore } from './wishlist-details.store';

const movie = toTitle(movieTitleDto);
const series = toTitle(seriesDto);
afterEach(() => TestBed.resetTestingModule());

it('loads both Wishlist kinds and lets the canonical URL own filters, sorting and pages', () => {
  const route = new BehaviorSubject(convertToParamMap({ search: 'Test', currentPage: '1' }));
  const execute = vi.fn(() => of({ media: [movie, series], totalCount: 61, currentPage: 1 }));
  const navigate = vi.fn(() => Promise.resolve(true));
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      WishlistStore,
      CatalogRouteState,
      { provide: ActivatedRoute, useValue: { queryParamMap: route } },
      { provide: Router, useValue: { navigate } },
      { provide: GetWishlistQuery, useValue: { execute } },
    ],
  });
  const store = TestBed.inject(WishlistStore);
  expect(store.titles().map((title) => title.kind)).toEqual(['movie', 'series']);
  expect(store.page()).toBe(2);
  store.applyFilters({ genres: ['Drama'] });
  expect(navigate).toHaveBeenLastCalledWith(
    [],
    expect.objectContaining({ queryParams: expect.objectContaining({ genres: ['Drama'], search: 'Test', currentPage: 0 }) }),
  );
  store.applySorting({ key: 'rating', direction: 'asc' });
  expect(navigate).toHaveBeenLastCalledWith(
    [],
    expect.objectContaining({ queryParams: expect.objectContaining({ key: 'rating', direction: 'asc', currentPage: 0 }) }),
  );
  store.changePage(3);
  expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: expect.objectContaining({ currentPage: 2 }) }));
  expect(execute).toHaveBeenCalledOnce();
  route.next(convertToParamMap({ search: 'Test', currentPage: '1' }));
  expect(execute).toHaveBeenCalledOnce();
  route.next(convertToParamMap({ genres: 'Drama' }));
  expect(execute).toHaveBeenCalledTimes(2);
});

it('cancels stale list reads and retries after an error', () => {
  const pending = new Subject<CollectionPage<Title>>();
  const route = new BehaviorSubject(convertToParamMap({}));
  const execute = vi
    .fn()
    .mockReturnValueOnce(pending)
    .mockReturnValueOnce(throwError(() => new Error('offline')))
    .mockReturnValueOnce(of({ media: [movie], totalCount: 1, currentPage: 0 }));
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      WishlistStore,
      CatalogRouteState,
      { provide: ActivatedRoute, useValue: { queryParamMap: route } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: GetWishlistQuery, useValue: { execute } },
    ],
  });
  const store = TestBed.inject(WishlistStore);
  route.next(convertToParamMap({ search: 'New' }));
  pending.next({ media: [series], totalCount: 1, currentPage: 0 });
  expect(store.status()).toBe('error');
  expect(store.titles()).toEqual([]);
  store.retry();
  expect(store.status()).toBe('loaded');
  expect(store.titles()).toEqual([movie]);
});

it('loads Wishlist detail IDs independently of library kind and cancels stale reads', () => {
  const route = new BehaviorSubject(convertToParamMap({ id: movie.id }));
  const pending = new Subject<Title>();
  const execute = vi
    .fn()
    .mockReturnValueOnce(of(movie))
    .mockReturnValueOnce(pending)
    .mockReturnValueOnce(throwError(() => new Error('offline')))
    .mockReturnValueOnce(of(series));
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      WishlistDetailsStore,
      { provide: ActivatedRoute, useValue: { paramMap: route } },
      { provide: GetWishlistTitleQuery, useValue: { execute } },
    ],
  });
  const store = TestBed.inject(WishlistDetailsStore);
  expect(store.title()?.kind).toBe('movie');
  route.next(convertToParamMap({ id: 'second' }));
  expect(store.title()).toBeNull();
  expect(store.status()).toBe('loading');
  route.next(convertToParamMap({ id: series.id }));
  pending.next(movie);
  expect(store.title()).toBeNull();
  expect(store.status()).toBe('error');
  store.retry();
  expect(execute).toHaveBeenLastCalledWith(series.id);
  expect(store.title()?.kind).toBe('series');
});

it('updates a refreshed card immediately, reconciles the current list and retains failed deletions', async () => {
  const refreshed = { ...movie, title: 'Fresh movie' };
  const pendingRefresh = new Subject<Title>();
  const listReload = new Subject<CollectionPage<Title>>();
  const refresh = vi.fn(() => pendingRefresh);
  const remove = vi
    .fn()
    .mockReturnValueOnce(throwError(() => new Error('offline')))
    .mockReturnValueOnce(of(undefined));
  const execute = vi
    .fn()
    .mockReturnValueOnce(of({ media: [movie], totalCount: 1, currentPage: 0 }))
    .mockReturnValueOnce(listReload)
    .mockReturnValueOnce(of({ media: [], totalCount: 0, currentPage: 0 }));
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      WishlistStore,
      CatalogRouteState,
      { provide: ActivatedRoute, useValue: { queryParamMap: new BehaviorSubject(convertToParamMap({})) } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: GetWishlistQuery, useValue: { execute } },
      { provide: RefreshWishlistUseCase, useValue: { execute: refresh } },
      { provide: DeleteWishlistUseCase, useValue: { execute: remove } },
    ],
  });
  const store = TestBed.inject(WishlistStore);
  const result = store.refresh(movie);
  await store.refresh(movie);
  expect(refresh).toHaveBeenCalledOnce();
  pendingRefresh.next(refreshed);
  await result;
  expect(store.titles()).toEqual([refreshed]);
  expect(execute).toHaveBeenCalledTimes(2);
  listReload.next({ media: [refreshed], totalCount: 1, currentPage: 0 });
  await store.deleteItem(movie.id);
  expect(store.titles()).toEqual([refreshed]);
  expect(store.totalCount()).toBe(1);
  await store.deleteItem(movie.id);
  expect(store.titles()).toEqual([]);
  expect(store.totalCount()).toBe(0);
  expect(execute).toHaveBeenCalledTimes(3);
});
