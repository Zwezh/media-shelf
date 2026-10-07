import { computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, exhaustMap, filter, map, pipe, switchMap, tap } from 'rxjs';
import type { SeriesTitle } from '../../catalog/models/title';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { DeleteSeriesUseCase } from '../application/delete-series.use-case';
import { GetSeriesTitleQuery } from '../application/get-series-title.query';

type SeriesDetailsState = {
  readonly deletingId: string | null;
  readonly title: SeriesTitle | null;
  readonly requestedId: string | null;
  readonly status: 'idle' | 'loading' | 'loaded' | 'error';
};

export const SeriesDetailsStore = signalStore(
  withState<SeriesDetailsState>({ deletingId: null, title: null, requestedId: null, status: 'idle' }),
  withComputed((store) => ({ isDeleting: computed(() => store.deletingId() !== null) })),
  withMethods(
    (
      store,
      query = inject(GetSeriesTitleQuery),
      deletion = inject(DeleteSeriesUseCase),
      feedback = inject(GalleryFeedback),
      router = inject(Router),
    ) => {
      const load = rxMethod<string>(
        pipe(
          tap((requestedId) => patchState(store, { status: 'loading', title: null, requestedId })),
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
      const deleteSeries = rxMethod<string>(
        pipe(
          filter((id) => store.deletingId() === null && store.title()?.id === id),
          tap((deletingId) => patchState(store, { deletingId })),
          exhaustMap((id) =>
            deletion.execute(id).pipe(
              tap(() => {
                patchState(store, { deletingId: null });
                feedback.success('series.delete.successTitle', 'series.delete.successMessage');
                if (store.requestedId() === id) void router.navigate(['/gallery/series'], { queryParamsHandling: 'preserve' });
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
