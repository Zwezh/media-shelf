import { RefreshWishlistUseCase } from '../../wishlist/application/refresh-wishlist.use-case';
import { DeleteWishlistUseCase } from '../../wishlist/application/delete-wishlist.use-case';
import { WISHLIST_MUTATION_TEST_PROVIDERS } from '@msh/testing/wishlist-testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { GalleryRouteState } from '../state/gallery-route-state';
import { movieTitleDto, seriesDto } from '../testing/title.fixture';
import { toTitle } from '../utils/title.converter';
import type { Title } from '../models/title';
import type { GalleryItem } from '../models/gallery-item';
import { wishlistSummary } from '../utils/gallery-display';
import { DeleteMovieUseCase } from '../../movies/application/delete-movie.use-case';
import { DeleteSeriesUseCase } from '../../series/application/delete-series.use-case';
import type { CollectionPage } from '../../models/collection-page';
import { GetGalleryQuery } from '../application/get-gallery.query';

import { GalleryStore } from './gallery.store';

const movie = wishlistSummary(toTitle(movieTitleDto));
const series = wishlistSummary(toTitle(seriesDto));
afterEach(() => TestBed.resetTestingModule());

it('loads all Gallery kinds and lets the canonical URL own filters, sorting and pages', () => {
  const route = new BehaviorSubject(convertToParamMap({ search: 'Test', currentPage: '1' }));
  const execute = vi.fn(() => of({ media: [movie, series], totalCount: 61, currentPage: 1 }));
  const navigate = vi.fn(() => Promise.resolve(true));
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      { provide: DeleteMovieUseCase, useValue: { execute: vi.fn() } },
      { provide: DeleteSeriesUseCase, useValue: { execute: vi.fn() } },
      GalleryStore,
      GalleryRouteState,
      { provide: ActivatedRoute, useValue: { queryParamMap: route } },
      { provide: Router, useValue: { navigate } },
      { provide: GetGalleryQuery, useValue: { execute } },
    ],
  });
  const store = TestBed.inject(GalleryStore);
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
  const pending = new Subject<CollectionPage<GalleryItem>>();
  const route = new BehaviorSubject(convertToParamMap({}));
  const execute = vi
    .fn()
    .mockReturnValueOnce(pending)
    .mockReturnValueOnce(throwError(() => new Error('offline')))
    .mockReturnValueOnce(of({ media: [movie], totalCount: 1, currentPage: 0 }));
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      { provide: DeleteMovieUseCase, useValue: { execute: vi.fn() } },
      { provide: DeleteSeriesUseCase, useValue: { execute: vi.fn() } },
      GalleryStore,
      GalleryRouteState,
      { provide: ActivatedRoute, useValue: { queryParamMap: route } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: GetGalleryQuery, useValue: { execute } },
    ],
  });
  const store = TestBed.inject(GalleryStore);
  route.next(convertToParamMap({ search: 'New' }));
  pending.next({ media: [series], totalCount: 1, currentPage: 0 });
  expect(store.status()).toBe('error');
  expect(store.titles()).toEqual([]);
  store.retry();
  expect(store.status()).toBe('loaded');
  expect(store.titles()).toEqual([movie]);
});

it('updates a refreshed card immediately, reconciles the current list and retains failed deletions', async () => {
  const refreshed = { ...toTitle(movieTitleDto), title: 'Fresh movie' };
  const pendingRefresh = new Subject<Title>();
  const listReload = new Subject<CollectionPage<GalleryItem>>();
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
      { provide: DeleteMovieUseCase, useValue: { execute: vi.fn() } },
      { provide: DeleteSeriesUseCase, useValue: { execute: vi.fn() } },
      GalleryStore,
      GalleryRouteState,
      { provide: ActivatedRoute, useValue: { queryParamMap: new BehaviorSubject(convertToParamMap({})) } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: GetGalleryQuery, useValue: { execute } },
      { provide: RefreshWishlistUseCase, useValue: { execute: refresh } },
      { provide: DeleteWishlistUseCase, useValue: { execute: remove } },
    ],
  });
  const store = TestBed.inject(GalleryStore);
  const result = store.refresh(movie);
  await store.refresh(movie);
  expect(refresh).toHaveBeenCalledOnce();
  pendingRefresh.next(refreshed);
  await result;
  expect(store.titles()).toEqual([wishlistSummary(refreshed)]);
  expect(execute).toHaveBeenCalledTimes(2);
  listReload.next({ media: [wishlistSummary(refreshed)], totalCount: 1, currentPage: 0 });
  await store.deleteItem(movie);
  expect(store.titles()).toEqual([wishlistSummary(refreshed)]);
  expect(store.totalCount()).toBe(1);
  await store.deleteItem(movie);
  expect(store.titles()).toEqual([]);
  expect(store.totalCount()).toBe(0);
  expect(execute).toHaveBeenCalledTimes(3);
});

it('dispatches deletes by collection and corrects a last page after reconciliation', async () => {
  const movieItem = { ...movie, collection: 'movies' as const };
  const seriesItem = { ...series, collection: 'series' as const, id: 'library-series' };
  const removeMovie = vi.fn(() => of(undefined));
  const removeSeries = vi.fn(() => of(undefined));
  const removeWish = vi.fn(() => of(undefined));
  const route = new BehaviorSubject(convertToParamMap({ currentPage: '1', pageSize: '1' }));
  const navigate = vi.fn();
  const execute = vi.fn(() => of({ media: [movieItem, seriesItem, movie], totalCount: 3, currentPage: 1 }));
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      GalleryStore,
      GalleryRouteState,
      { provide: ActivatedRoute, useValue: { queryParamMap: route } },
      { provide: Router, useValue: { navigate } },
      { provide: GetGalleryQuery, useValue: { execute } },
      { provide: DeleteMovieUseCase, useValue: { execute: removeMovie } },
      { provide: DeleteSeriesUseCase, useValue: { execute: removeSeries } },
      { provide: DeleteWishlistUseCase, useValue: { execute: removeWish } },
    ],
  });
  const store = TestBed.inject(GalleryStore);
  await store.deleteItem(movieItem);
  await store.deleteItem(seriesItem);
  execute.mockReturnValue(of({ media: [], totalCount: 0, currentPage: 1 }));
  await store.deleteItem(movie);
  expect(removeMovie).toHaveBeenCalledWith(movieItem.id);
  expect(removeSeries).toHaveBeenCalledWith(seriesItem.id);
  expect(removeWish).toHaveBeenCalledWith(movie.id);
  expect(navigate).toHaveBeenLastCalledWith(
    [],
    expect.objectContaining({ replaceUrl: true, queryParams: expect.objectContaining({ currentPage: 0 }) }),
  );
});
