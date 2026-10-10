import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, exhaustMap, filter, pipe, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS, type CatalogParams } from '../../catalog/models/catalog-params';
import type { SeriesTitle } from '../../catalog/models/title';
import type { CollectionFilterKey, CollectionFilters } from '../../models/collection-filters';
import type { CollectionSorting } from '../../models/collection-sorting';
import {
  countActiveCollectionFilters,
  extractCollectionFilters,
  removeCollectionFilters,
  replaceCollectionFilters,
} from '../../utils/collection-filters';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { DeleteSeriesUseCase } from '../application/delete-series.use-case';
import { GetSeriesQuery } from '../application/get-series.query';
import { CatalogRouteState } from '../../catalog/state/catalog-route-state';

type SeriesState = {
  readonly deletingId: string | null;
  readonly status: 'idle' | 'loading' | 'loaded' | 'error';
  readonly titles: readonly SeriesTitle[];
  readonly totalCount: number;
  readonly params: CatalogParams;
};

export const SeriesStore = signalStore(
  withState<SeriesState>({ deletingId: null, status: 'idle', titles: [], totalCount: 0, params: DEFAULT_CATALOG_PARAMS }),
  withComputed(({ params, deletingId }) => ({
    isDeleting: computed(() => deletingId() !== null),
    filters: computed(() => extractCollectionFilters(params())),
    activeFilterCount: computed(() => countActiveCollectionFilters(extractCollectionFilters(params()))),
    page: computed(() => params().currentPage + 1),
    sorting: computed(() => ({ key: params().key, direction: params().direction })),
  })),
  withMethods(
    (
      store,
      query = inject(GetSeriesQuery),
      route = inject(CatalogRouteState),
      deletion = inject(DeleteSeriesUseCase),
      feedback = inject(GalleryFeedback),
    ) => {
      const deleted = new Subject<void>();
      const load = rxMethod<CatalogParams>(
        pipe(
          tap((params) => patchState(store, { status: 'loading', params })),
          switchMap((params) =>
            query.execute(params).pipe(
              takeUntil(deleted),
              tap(({ media, totalCount }) => {
                const lastPage = Math.max(0, Math.ceil(totalCount / params.pageSize) - 1);
                if (params.currentPage > lastPage) {
                  route.navigate({ ...params, currentPage: lastPage }, true);
                  return;
                }
                patchState(store, { titles: media, totalCount, status: 'loaded' });
              }),
              catchError(() => {
                patchState(store, { status: 'error', titles: [], totalCount: 0 });
                return EMPTY;
              }),
            ),
          ),
        ),
      );
      const deleteSeries = rxMethod<string>(
        pipe(
          filter(() => store.deletingId() === null),
          tap((deletingId) => patchState(store, { deletingId })),
          exhaustMap((id) =>
            deletion.execute(id).pipe(
              tap(() => {
                const wasLoading = store.status() === 'loading';
                deleted.next();
                feedback.success('series.delete.successTitle', 'series.delete.successMessage');
                if (wasLoading) {
                  patchState(store, { deletingId: null });
                  load(store.params());
                  return;
                }
                const titles = store.titles().filter((title) => title.id !== id);
                const totalCount = Math.max(0, store.totalCount() - 1);
                patchState(store, { deletingId: null, titles, totalCount });
                if (titles.length === 0 && totalCount > 0 && store.params().currentPage > 0)
                  route.navigate({ ...store.params(), currentPage: store.params().currentPage - 1 }, true);
              }),
              catchError(() => {
                patchState(store, { deletingId: null });
                feedback.error('series.delete.errorTitle', 'series.delete.errorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );
      return {
        deleteSeries,
        load,
        retry(): void {
          load(store.params());
        },
        applyFilters(filters: CollectionFilters): void {
          route.navigate(replaceCollectionFilters(store.params(), filters));
        },
        clearFilters(): void {
          route.navigate(replaceCollectionFilters(store.params(), {}));
        },
        removeFilters(keys: readonly CollectionFilterKey[]): void {
          route.navigate(removeCollectionFilters(store.params(), keys));
        },
        applySorting(sorting: CollectionSorting): void {
          const key = CATALOG_SORTING_KEYS.find((value) => value === sorting.key);
          const params = store.params();
          if (key && (key !== params.key || sorting.direction !== params.direction))
            route.navigate({ ...params, key, direction: sorting.direction, currentPage: 0 });
        },
        changePage(page: number): void {
          const currentPage = page - 1;
          if (currentPage >= 0 && currentPage !== store.params().currentPage) route.navigate({ ...store.params(), currentPage });
        },
      };
    },
  ),
  withHooks((store, route = inject(CatalogRouteState)) => ({
    onInit(): void {
      store.load(route.query);
    },
  })),
);
