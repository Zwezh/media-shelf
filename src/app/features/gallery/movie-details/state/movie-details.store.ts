import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, filter, map, pipe, switchMap, tap } from 'rxjs';
import { type MovieDetails } from '../../models/movie-details';
import { DeleteMovieUseCase } from '../../movies/application/delete-movie.use-case';
import { GetMovieDetailsQuery } from '../../movies/application/get-movie-details.query';
import { MovieFeedback } from '../../movies/ui/movie-feedback';

type MovieDetailsState = {
  readonly hasError: boolean;
  readonly isLoading: boolean;
  readonly isDeleting: boolean;
  readonly movie: MovieDetails | null;
  readonly requestedId: string | null;
};

const initialState: MovieDetailsState = {
  hasError: false,
  isLoading: false,
  isDeleting: false,
  movie: null,
  requestedId: null,
};

export const MovieDetailsStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      deleteMovieUseCase = inject(DeleteMovieUseCase),
      feedback = inject(MovieFeedback),
      getMovieDetails = inject(GetMovieDetailsQuery),
      router = inject(Router),
    ) => {
      const loadMovie = rxMethod<string>(
        pipe(
          tap((requestedId) => patchState(store, { hasError: false, isLoading: true, movie: null, requestedId })),
          switchMap((requestedId) =>
            getMovieDetails.execute(requestedId).pipe(
              tap((movie) => {
                patchState(store, { hasError: false, isLoading: false, movie });
              }),
              catchError(() => {
                patchState(store, { hasError: true, isLoading: false, movie: null });
                feedback.error('movieDetails.loadErrorTitle', 'movieDetails.loadErrorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const deleteMovie = rxMethod<string>(
        pipe(
          filter(() => !store.isDeleting()),
          tap(() => patchState(store, { isDeleting: true })),
          switchMap((id) =>
            deleteMovieUseCase.execute(id).pipe(
              tap(() => {
                patchState(store, { isDeleting: false });
                feedback.success('movieDetails.delete.successTitle', 'movieDetails.delete.successMessage');
                void router.navigate(['/gallery/movies'], { queryParamsHandling: 'preserve' });
              }),
              catchError(() => {
                patchState(store, { isDeleting: false });
                feedback.error('movieDetails.delete.errorTitle', 'movieDetails.delete.errorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      return {
        deleteMovie,
        loadMovie,
        retry(): void {
          const requestedId = store.requestedId();
          if (requestedId) loadMovie(requestedId);
        },
      };
    },
  ),
  withHooks((store, route = inject(ActivatedRoute)) => ({
    onInit(): void {
      store.loadMovie(
        route.paramMap.pipe(
          map((params) => params.get('id')?.trim() ?? ''),
          filter((id) => id.length > 0),
          distinctUntilChanged(),
        ),
      );
    },
  })),
);
