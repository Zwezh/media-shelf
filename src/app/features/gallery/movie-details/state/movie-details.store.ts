import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { catchError, distinctUntilChanged, EMPTY, filter, map, pipe, switchMap, tap } from 'rxjs';
import { ToastStore } from '@msh-shared/services/toast-store';
import { GalleryApi } from '../../data-access/gallery-api';
import { type MovieDetails } from '../../models/movie-details';

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
      galleryApi = inject(GalleryApi),
      router = inject(Router),
      toastStore = inject(ToastStore),
      translate = inject(TranslateService),
    ) => {
      const loadMovie = rxMethod<string>(
        pipe(
          tap((requestedId) => patchState(store, { hasError: false, isLoading: true, movie: null, requestedId })),
          switchMap((requestedId) =>
            galleryApi.getMovie(requestedId).pipe(
              tap((movie) => {
                patchState(store, { hasError: false, isLoading: false, movie });
                toastStore.success({
                  message: String(translate.instant('movieDetails.loadSuccessMessage')),
                  title: String(translate.instant('movieDetails.loadSuccessTitle')),
                });
              }),
              catchError(() => {
                patchState(store, { hasError: true, isLoading: false, movie: null });
                toastStore.error({
                  message: String(translate.instant('movieDetails.loadErrorMessage')),
                  title: String(translate.instant('movieDetails.loadErrorTitle')),
                });
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
            galleryApi.deleteMovie(id).pipe(
              tap(() => {
                patchState(store, { isDeleting: false });
                toastStore.success({
                  message: String(translate.instant('movieDetails.delete.successMessage')),
                  title: String(translate.instant('movieDetails.delete.successTitle')),
                });
                void router.navigate(['/gallery/movies'], { queryParamsHandling: 'preserve' });
              }),
              catchError(() => {
                patchState(store, { isDeleting: false });
                toastStore.error({
                  message: String(translate.instant('movieDetails.delete.errorMessage')),
                  title: String(translate.instant('movieDetails.delete.errorTitle')),
                });
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
    onInit() {
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
