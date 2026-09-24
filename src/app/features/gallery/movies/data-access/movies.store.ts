import { computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { catchError, concat, distinctUntilChanged, EMPTY, map, of, pipe, switchMap, tap, timer } from 'rxjs';
import { ToastStore } from '@msh-shared/services/toast-store';
import { GalleryApi } from '../../data-access/gallery-api';
import { type Media } from '../../models/media';
import { type MoviesParams } from '../../models/movies-params';
import { DEFAULT_MOVIES_PARAMS, readMoviesParams, toMoviesQueryParams } from '../../utils/movies-params';

const MOVIES_POLL_INTERVAL_MS = 30_000;
const POLL_SUCCESS_TOAST_DELAY_MS = 2_500;
const POLL_ERROR_TOAST_DELAY_MS = 5_000;

type MoviesLoadRequest = {
  readonly isPolling: boolean;
  readonly params: MoviesParams;
};

type MoviesState = {
  readonly media: readonly Media[];
  readonly params: MoviesParams;
  readonly totalCount: number;
  readonly isLoading: boolean;
  readonly hasError: boolean;
};

const initialState: MoviesState = {
  media: [],
  params: DEFAULT_MOVIES_PARAMS,
  totalCount: 0,
  isLoading: false,
  hasError: false,
};

export const MoviesStore = signalStore(
  withState(initialState),
  withComputed(({ media, params }) => ({
    page: computed(() => params().currentPage + 1),
    pageSize: computed(() => params().pageSize),
    visibleMedia: computed(() => media()),
  })),
  withMethods(
    (
      store,
      galleryApi = inject(GalleryApi),
      route = inject(ActivatedRoute),
      router = inject(Router),
      toastStore = inject(ToastStore),
      translate = inject(TranslateService),
    ) => ({
      changePage(page: number): void {
        const currentPage = page - 1;
        if (currentPage === store.params().currentPage) return;

        void router.navigate([], {
          relativeTo: route,
          queryParams: toMoviesQueryParams({ ...store.params(), currentPage }),
        });
      },
      loadMovies: rxMethod<MoviesLoadRequest>(
        pipe(
          tap(({ isPolling, params }) => {
            patchState(store, isPolling ? { params } : { hasError: false, isLoading: true, params });
          }),
          switchMap(({ isPolling, params }) =>
            galleryApi.getMovies(params).pipe(
              tap(({ media, totalCount }) => {
                const lastPage = Math.max(0, Math.ceil(totalCount / params.pageSize) - 1);
                if (params.currentPage > lastPage) {
                  void router.navigate([], {
                    relativeTo: route,
                    queryParams: toMoviesQueryParams({ ...params, currentPage: lastPage }),
                    replaceUrl: true,
                  });
                  return;
                }

                patchState(store, { hasError: false, isLoading: false, media, totalCount });
                toastStore.success({
                  autoHide: true,
                  delay: POLL_SUCCESS_TOAST_DELAY_MS,
                  message: String(translate.instant('movies.pollSuccessMessage')),
                  title: String(translate.instant('movies.pollSuccessTitle')),
                });
              }),
              catchError(() => {
                if (isPolling) {
                  patchState(store, { isLoading: false });
                } else {
                  patchState(store, { hasError: true, isLoading: false, media: [], totalCount: 0 });
                }
                toastStore.error({
                  autoHide: true,
                  delay: POLL_ERROR_TOAST_DELAY_MS,
                  message: String(translate.instant('movies.pollErrorMessage')),
                  title: String(translate.instant('movies.pollErrorTitle')),
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    }),
  ),
  withHooks((store, route = inject(ActivatedRoute), router = inject(Router)) => ({
    onInit() {
      const initialParams = readMoviesParams(route.snapshot.queryParamMap);

      store.loadMovies(
        route.queryParamMap.pipe(
          map(readMoviesParams),
          distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
          switchMap((params) =>
            concat(
              of({ isPolling: false, params }),
              timer(MOVIES_POLL_INTERVAL_MS, MOVIES_POLL_INTERVAL_MS).pipe(map(() => ({ isPolling: true, params }))),
            ),
          ),
        ),
      );

      void router.navigate([], {
        relativeTo: route,
        queryParams: toMoviesQueryParams(initialParams),
        replaceUrl: true,
      });
    },
  })),
);
