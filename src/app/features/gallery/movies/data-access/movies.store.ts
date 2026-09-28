import { computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { catchError, distinctUntilChanged, EMPTY, filter, map, pipe, switchMap, tap } from 'rxjs';
import { TOAST_AUTO_HIDE_DELAY_MS } from '@msh-shared/config/toast';
import { ToastStore } from '@msh-shared/services/toast-store';
import { GalleryApi } from '../../data-access/gallery-api';
import { type Media } from '../../models/media';
import { type MovieFilterKey, type MoviesFilters } from '../../models/movies-filters';
import { type MoviesParams } from '../../models/movies-params';
import { type MoviesSorting } from '../../models/movies-sorting';
import { countActiveMovieFilters, extractMoviesFilters, removeMovieFilters, replaceMovieFilters } from '../../utils/movies-filters';
import { DEFAULT_MOVIES_PARAMS, readMoviesParams, toMoviesQueryParams } from '../../utils/movies-params';

type MoviesState = {
  readonly media: readonly Media[];
  readonly params: MoviesParams;
  readonly totalCount: number;
  readonly isDeleting: boolean;
  readonly isLoading: boolean;
  readonly hasError: boolean;
};

const initialState: MoviesState = {
  media: [],
  params: DEFAULT_MOVIES_PARAMS,
  totalCount: 0,
  isDeleting: false,
  isLoading: false,
  hasError: false,
};

export const MoviesStore = signalStore(
  withState(initialState),
  withComputed(({ media, params }) => ({
    activeFilterCount: computed(() => countActiveMovieFilters(extractMoviesFilters(params()))),
    appliedFilters: computed(() => extractMoviesFilters(params())),
    page: computed(() => params().currentPage + 1),
    pageSize: computed(() => params().pageSize),
    sorting: computed<MoviesSorting>(() => ({ direction: params().direction, key: params().key })),
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
    ) => {
      const deleteMovie = rxMethod<string>(
        pipe(
          filter(() => !store.isDeleting()),
          tap(() => patchState(store, { isDeleting: true })),
          switchMap((id) =>
            galleryApi.deleteMovie(id).pipe(
              tap(() => {
                const media = store.media().filter((item) => item.id !== id);
                const totalCount = Math.max(0, store.totalCount() - 1);
                patchState(store, { isDeleting: false, media, totalCount });
                toastStore.success({
                  autoHide: true,
                  delay: TOAST_AUTO_HIDE_DELAY_MS.success,
                  message: String(translate.instant('movies.delete.successMessage')),
                  title: String(translate.instant('movies.delete.successTitle')),
                });

                if (media.length === 0 && totalCount > 0 && store.params().currentPage > 0) {
                  void router.navigate([], {
                    relativeTo: route,
                    queryParams: toMoviesQueryParams({ ...store.params(), currentPage: store.params().currentPage - 1 }),
                    replaceUrl: true,
                  });
                }
              }),
              catchError(() => {
                patchState(store, { isDeleting: false });
                toastStore.error({
                  autoHide: true,
                  delay: TOAST_AUTO_HIDE_DELAY_MS.error,
                  message: String(translate.instant('movies.delete.errorMessage')),
                  title: String(translate.instant('movies.delete.errorTitle')),
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const loadMovies = rxMethod<MoviesParams>(
        pipe(
          tap((params) => {
            patchState(store, { hasError: false, isLoading: true, params });
          }),
          switchMap((params) =>
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
                  delay: TOAST_AUTO_HIDE_DELAY_MS.success,
                  message: String(translate.instant('movies.loadSuccessMessage')),
                  title: String(translate.instant('movies.loadSuccessTitle')),
                });
              }),
              catchError(() => {
                patchState(store, { hasError: true, isLoading: false, media: [], totalCount: 0 });
                toastStore.error({
                  autoHide: true,
                  delay: TOAST_AUTO_HIDE_DELAY_MS.error,
                  message: String(translate.instant('movies.loadErrorMessage')),
                  title: String(translate.instant('movies.loadErrorTitle')),
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      return {
        changePage(page: number): void {
          const currentPage = page - 1;
          if (currentPage === store.params().currentPage) return;

          void router.navigate([], {
            relativeTo: route,
            queryParams: toMoviesQueryParams({ ...store.params(), currentPage }),
          });
        },
        applyFilters(filters: MoviesFilters): void {
          void router.navigate([], {
            relativeTo: route,
            queryParams: toMoviesQueryParams(replaceMovieFilters(store.params(), filters)),
          });
        },
        applySorting(sorting: MoviesSorting): void {
          const params = store.params();
          if (params.direction === sorting.direction && params.key === sorting.key) return;

          void router.navigate([], {
            relativeTo: route,
            queryParams: toMoviesQueryParams({ ...params, ...sorting, currentPage: 0 }),
          });
        },
        clearFilters(): void {
          void router.navigate([], {
            relativeTo: route,
            queryParams: toMoviesQueryParams(replaceMovieFilters(store.params(), {})),
          });
        },
        deleteMovie,
        loadMovies,
        removeFilters(keys: readonly MovieFilterKey[]): void {
          void router.navigate([], {
            relativeTo: route,
            queryParams: toMoviesQueryParams(removeMovieFilters(store.params(), keys)),
          });
        },
        retry(): void {
          loadMovies(store.params());
        },
      };
    },
  ),
  withHooks((store, route = inject(ActivatedRoute)) => ({
    onInit() {
      store.loadMovies(
        route.queryParamMap.pipe(
          map(readMoviesParams),
          distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
        ),
      );
    },
  })),
);
