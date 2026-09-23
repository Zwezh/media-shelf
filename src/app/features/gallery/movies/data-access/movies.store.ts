import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { MediaDto } from '../../models/media.dto';
import { Media } from '../../models/media';
import { toMedia } from '../../utils/media.converter';

type MoviesState = {
  readonly media: readonly Media[];
  readonly page: number;
  readonly isLoading: boolean;
  readonly hasError: boolean;
};

const initialState: MoviesState = {
  media: [],
  page: 1,
  isLoading: false,
  hasError: false,
};

export const MoviesStore = signalStore(
  withState(initialState),
  withComputed(({ media, page }) => ({
    visibleMedia: computed(() => {
      const start = (page() - 1) * DEFAULT_PAGE_SIZE;
      return media().slice(start, start + DEFAULT_PAGE_SIZE);
    }),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    changePage(page: number): void {
      patchState(store, { page });
    },
    loadMovies: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { hasError: false, isLoading: true })),
        switchMap(() =>
          http.get<MediaDto[]>('/mock-data.json').pipe(
            tap((media) => patchState(store, { isLoading: false, media: media.map(toMedia) })),
            catchError(() => {
              patchState(store, { hasError: true, isLoading: false, media: [] });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadMovies();
    },
  }),
);
