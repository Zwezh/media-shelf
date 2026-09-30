import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, pipe, switchMap, tap } from 'rxjs';
import { type Media } from '../../models/media';
import { type MovieFilterKey, type MoviesFilters } from '../../models/movies-filters';
import { type MoviesParams } from '../../models/movies-params';
import { type MoviesSorting } from '../../models/movies-sorting';
import { countActiveMovieFilters, extractMoviesFilters, removeMovieFilters, replaceMovieFilters } from '../../utils/movies-filters';
import { DEFAULT_MOVIES_PARAMS } from '../../utils/movies-params';
import { DeleteMovieUseCase } from '../application/delete-movie.use-case';
import { GetMoviesQuery } from '../application/get-movies.query';
import { MovieFeedback } from '../ui/movie-feedback';
import { MoviesRouteState } from './movies-route-state';

type MoviesState = {
  readonly deletingId: string | null;
  readonly hasError: boolean;
  readonly isLoading: boolean;
  readonly media: readonly Media[];
  readonly params: MoviesParams;
  readonly totalCount: number;
};

const initialState: MoviesState = {
  deletingId: null,
  hasError: false,
  isLoading: false,
  media: [],
  params: DEFAULT_MOVIES_PARAMS,
  totalCount: 0,
};

export const MoviesStore = signalStore(
  withState(initialState),
  withComputed(({ deletingId, media, params }) => ({
    activeFilterCount: computed(() => countActiveMovieFilters(extractMoviesFilters(params()))),
    appliedFilters: computed(() => extractMoviesFilters(params())),
    isDeleting: computed(() => deletingId() !== null),
    page: computed(() => params().currentPage + 1),
    pageSize: computed(() => params().pageSize),
    sorting: computed<MoviesSorting>(() => ({ direction: params().direction, key: params().key })),
    visibleMedia: computed(() => media()),
  })),
  withMethods(
    (
      store,
      deleteMovieUseCase = inject(DeleteMovieUseCase),
      feedback = inject(MovieFeedback),
      getMovies = inject(GetMoviesQuery),
      routeState = inject(MoviesRouteState),
    ) => {
      const deleteMovie = rxMethod<string>(
        pipe(
          filter(() => store.deletingId() === null),
          tap((id) => patchState(store, { deletingId: id })),
          switchMap((id) =>
            deleteMovieUseCase.execute(id).pipe(
              tap(() => {
                const media = store.media().filter((item) => item.id !== id);
                const totalCount = Math.max(0, store.totalCount() - 1);
                patchState(store, { deletingId: null, media, totalCount });
                feedback.success('movies.delete.successTitle', 'movies.delete.successMessage');

                if (media.length === 0 && totalCount > 0 && store.params().currentPage > 0) {
                  routeState.navigate({ ...store.params(), currentPage: store.params().currentPage - 1 }, true);
                }
              }),
              catchError(() => {
                patchState(store, { deletingId: null });
                feedback.error('movies.delete.errorTitle', 'movies.delete.errorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const loadMovies = rxMethod<MoviesParams>(
        pipe(
          tap((params) => patchState(store, { hasError: false, isLoading: true, params })),
          switchMap((params) =>
            getMovies.execute(params).pipe(
              tap(({ media, totalCount }) => {
                const lastPage = Math.max(0, Math.ceil(totalCount / params.pageSize) - 1);
                if (params.currentPage > lastPage) {
                  routeState.navigate({ ...params, currentPage: lastPage }, true);
                  return;
                }
                patchState(store, { hasError: false, isLoading: false, media, totalCount });
                feedback.success('movies.loadSuccessTitle', 'movies.loadSuccessMessage');
              }),
              catchError(() => {
                patchState(store, { hasError: true, isLoading: false, media: [], totalCount: 0 });
                feedback.error('movies.loadErrorTitle', 'movies.loadErrorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      return {
        applyFilters(filters: MoviesFilters): void {
          routeState.navigate(replaceMovieFilters(store.params(), filters));
        },
        applySorting(sorting: MoviesSorting): void {
          const params = store.params();
          if (params.direction !== sorting.direction || params.key !== sorting.key) {
            routeState.navigate({ ...params, ...sorting, currentPage: 0 });
          }
        },
        changePage(page: number): void {
          const currentPage = page - 1;
          if (currentPage !== store.params().currentPage) routeState.navigate({ ...store.params(), currentPage });
        },
        clearFilters(): void {
          routeState.navigate(replaceMovieFilters(store.params(), {}));
        },
        deleteMovie,
        loadMovies,
        removeFilters(keys: readonly MovieFilterKey[]): void {
          routeState.navigate(removeMovieFilters(store.params(), keys));
        },
        retry(): void {
          loadMovies(store.params());
        },
      };
    },
  ),
  withHooks((store, routeState = inject(MoviesRouteState)) => ({
    onInit(): void {
      store.loadMovies(routeState.query);
    },
  })),
);
