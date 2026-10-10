import { Router } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { AppError } from '@msh-core/http/app-error';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { RefreshWishlistUseCase } from '../application/refresh-wishlist.use-case';
import { DeleteWishlistUseCase } from '../application/delete-wishlist.use-case';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, filter, map, pipe, switchMap, tap } from 'rxjs';
import type { Title } from '../../catalog/models/title';
import { GetWishlistTitleQuery } from '../application/get-wishlist-title.query';

type WishlistDetailsState = {
  readonly pending: boolean;
  readonly title: Title | null;
  readonly requestedId: string | null;
  readonly status: 'idle' | 'loading' | 'loaded' | 'error';
};

export const WishlistDetailsStore = signalStore(
  withState<WishlistDetailsState>({ pending: false, title: null, requestedId: null, status: 'idle' }),
  withMethods(
    (
      store,
      query = inject(GetWishlistTitleQuery),
      refreshTitle = inject(RefreshWishlistUseCase),
      deleteTitle = inject(DeleteWishlistUseCase),
      feedback = inject(GalleryFeedback),
      router = inject(Router),
      destroyRef = inject(DestroyRef),
    ) => {
      let generation = 0;
      const load = rxMethod<string>(
        pipe(
          tap((requestedId) => {
            generation++;
            patchState(store, { status: 'loading', title: null, requestedId, pending: false });
          }),
          switchMap((id) =>
            query.execute(id).pipe(
              tap((title) => patchState(store, { title, status: 'loaded' })),
              catchError(() => {
                patchState(store, { title: null, status: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      );
      return {
        load,
        async refresh(): Promise<void> {
          const title = store.title();
          if (!title?.kpId || store.pending()) return;
          const current = generation;
          patchState(store, { pending: true });
          try {
            const updated = await firstValueFrom(refreshTitle.execute(title.id, title.kpId).pipe(takeUntilDestroyed(destroyRef)));
            if (current === generation) {
              patchState(store, { title: updated });
              feedback.success('wishlist.refresh', 'wishlist.refreshed');
            }
          } catch (error: unknown) {
            if (current === generation && !destroyRef.destroyed)
              feedback.error(
                'wishlist.refresh',
                error instanceof AppError && error.kind === 'conflict' ? 'wishlist.conflict' : 'wishlist.mutationError',
              );
          } finally {
            if (current === generation) patchState(store, { pending: false });
          }
        },
        async deleteItem(): Promise<void> {
          const title = store.title();
          if (!title || store.pending()) return;
          const current = generation;
          patchState(store, { pending: true });
          try {
            await firstValueFrom(deleteTitle.execute(title.id).pipe(takeUntilDestroyed(destroyRef)));
            if (current === generation) {
              feedback.success('wishlist.delete.title', 'wishlist.deleted');
              void router.navigate(['/gallery/wishlist'], { queryParamsHandling: 'preserve' });
            }
          } catch {
            if (current === generation && !destroyRef.destroyed) feedback.error('wishlist.delete.title', 'wishlist.mutationError');
          } finally {
            if (current === generation) patchState(store, { pending: false });
          }
        },
        retry(): void {
          const id = store.requestedId();
          if (id) load(id);
        },
      };
    },
  ),
  withHooks((store, route = inject(ActivatedRoute)) => ({
    onInit(): void {
      store.load(
        route.paramMap.pipe(
          map((params) => params.get('id')?.trim() ?? ''),
          filter((id) => id.length > 0),
          distinctUntilChanged(),
        ),
      );
    },
  })),
);
