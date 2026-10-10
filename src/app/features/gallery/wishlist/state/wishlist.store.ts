import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { AppError } from '@msh-core/http/app-error';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { RefreshWishlistUseCase } from '../application/refresh-wishlist.use-case';
import { DeleteWishlistUseCase } from '../application/delete-wishlist.use-case';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS, type CatalogParams } from '../../catalog/models/catalog-params';
import type { Title } from '../../catalog/models/title';
import type { CollectionFilterKey, CollectionFilters } from '../../models/collection-filters';
import type { CollectionSorting } from '../../models/collection-sorting';
import {
  countActiveCollectionFilters,
  extractCollectionFilters,
  removeCollectionFilters,
  replaceCollectionFilters,
} from '../../utils/collection-filters';
import { GetWishlistQuery } from '../application/get-wishlist.query';
import { CatalogRouteState } from '../../catalog/state/catalog-route-state';

type WishlistState = {
  readonly status: 'idle' | 'loading' | 'loaded' | 'error';
  readonly titles: readonly Title[];
  readonly totalCount: number;
  readonly params: CatalogParams;
  readonly pendingIds: readonly string[];
};

export const WishlistStore = signalStore(
  withState<WishlistState>({ status: 'idle', pendingIds: [], titles: [], totalCount: 0, params: DEFAULT_CATALOG_PARAMS }),
  withComputed(({ params }) => ({
    filters: computed(() => extractCollectionFilters(params())),
    activeFilterCount: computed(() => countActiveCollectionFilters(extractCollectionFilters(params()))),
    page: computed(() => params().currentPage + 1),
    sorting: computed(() => ({ key: params().key, direction: params().direction })),
  })),
  withMethods(
    (
      store,
      query = inject(GetWishlistQuery),
      route = inject(CatalogRouteState),
      refreshTitle = inject(RefreshWishlistUseCase),
      deleteTitle = inject(DeleteWishlistUseCase),
      feedback = inject(GalleryFeedback),
      destroyRef = inject(DestroyRef),
    ) => {
      const load = rxMethod<CatalogParams>(
        pipe(
          tap((params) => patchState(store, { status: store.titles().length ? 'loaded' : 'loading', params })),
          switchMap((params) =>
            query.execute(params).pipe(
              tap(({ media, totalCount }) => {
                const lastPage = Math.max(0, Math.ceil(totalCount / params.pageSize) - 1);
                if (params.currentPage > lastPage) {
                  route.navigate({ ...params, currentPage: lastPage }, true);
                  return;
                }
                patchState(store, { titles: media, totalCount, status: 'loaded' });
              }),
              catchError(() => {
                if (store.titles().length) {
                  patchState(store, { status: 'loaded' });
                  feedback.error('wishlist.details', 'wishlist.loadError');
                } else patchState(store, { status: 'error', titles: [], totalCount: 0 });
                return EMPTY;
              }),
            ),
          ),
        ),
      );
      return {
        load,
        async refresh(title: Title): Promise<void> {
          if (!title.kpId || store.pendingIds().includes(title.id)) return;
          const params = store.params();
          patchState(store, { pendingIds: [...store.pendingIds(), title.id] });
          try {
            const updated = await firstValueFrom(refreshTitle.execute(title.id, title.kpId).pipe(takeUntilDestroyed(destroyRef)));
            if (store.params() === params)
              patchState(store, { titles: store.titles().map((item) => (item.id === updated.id ? updated : item)) });
            feedback.success('wishlist.refresh', 'wishlist.refreshed');
            load(store.params());
          } catch (error: unknown) {
            if (!destroyRef.destroyed)
              feedback.error(
                'wishlist.refresh',
                error instanceof AppError && error.kind === 'conflict' ? 'wishlist.conflict' : 'wishlist.mutationError',
              );
          } finally {
            patchState(store, { pendingIds: store.pendingIds().filter((id) => id !== title.id) });
          }
        },
        async deleteItem(id: string): Promise<void> {
          if (store.pendingIds().includes(id)) return;
          patchState(store, { pendingIds: [...store.pendingIds(), id] });
          try {
            await firstValueFrom(deleteTitle.execute(id).pipe(takeUntilDestroyed(destroyRef)));
            patchState(store, { titles: store.titles().filter((item) => item.id !== id), totalCount: Math.max(0, store.totalCount() - 1) });
            feedback.success('wishlist.delete.title', 'wishlist.deleted');
            load(store.params());
          } catch {
            if (!destroyRef.destroyed) feedback.error('wishlist.delete.title', 'wishlist.mutationError');
          } finally {
            patchState(store, { pendingIds: store.pendingIds().filter((item) => item !== id) });
          }
        },
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
