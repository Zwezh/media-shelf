import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, type Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { catchError, distinctUntilChanged, EMPTY, filter, map, pipe, switchMap, tap } from 'rxjs';
import { TOAST_AUTO_HIDE_DELAY_MS } from '@msh-shared/config/toast';
import { ToastStore } from '@msh-shared/services/toast-store';
import { GalleryApi } from '../../data-access/gallery-api';
import { type MediaDto } from '../../models/media.dto';
import { KinopoiskApi } from '../data-access/kinopoisk-api';
import { type MovieEditorModel, type MovieEditorMode, createEmptyMovieEditorModel } from '../models/movie-editor.model';
import { mergeMovieAutofill, toMovieEditorModel } from '../utils/movie-editor.converter';

type AutofillCommand = {
  readonly currentModel: Signal<MovieEditorModel>;
  readonly id: number;
};

type MovieEditorState = {
  readonly hasLoadError: boolean;
  readonly isAutofilling: boolean;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly mode: MovieEditorMode;
  readonly movieId: string;
  readonly seed: MovieEditorModel;
};

const initialState: MovieEditorState = {
  hasLoadError: false,
  isAutofilling: false,
  isLoading: false,
  isSaving: false,
  mode: 'add',
  movieId: '',
  seed: createEmptyMovieEditorModel(),
};

export const MovieEditorStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    breadcrumbTitle: computed(() => (store.mode() === 'add' ? '' : store.seed().name)),
    isBusy: computed(() => store.isLoading() || store.isSaving() || store.isAutofilling()),
  })),
  withMethods(
    (
      store,
      galleryApi = inject(GalleryApi),
      kinopoiskApi = inject(KinopoiskApi),
      location = inject(Location),
      router = inject(Router),
      toastStore = inject(ToastStore),
      translate = inject(TranslateService),
    ) => {
      const showToast = (type: 'error' | 'success', titleKey: string, messageKey: string): void => {
        toastStore[type]({
          autoHide: true,
          delay: type === 'success' ? TOAST_AUTO_HIDE_DELAY_MS.success : TOAST_AUTO_HIDE_DELAY_MS.error,
          message: String(translate.instant(messageKey)),
          title: String(translate.instant(titleKey)),
        });
      };

      const loadMovie = rxMethod<string>(
        pipe(
          tap((movieId) => patchState(store, { hasLoadError: false, isLoading: true, movieId })),
          switchMap((movieId) =>
            galleryApi.getMovieDto(movieId).pipe(
              tap((movie) => patchState(store, { hasLoadError: false, isLoading: false, seed: toMovieEditorModel(movie) })),
              catchError(() => {
                patchState(store, { hasLoadError: true, isLoading: false });
                showToast('error', 'movieEditor.toasts.loadErrorTitle', 'movieEditor.toasts.loadErrorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const autofill = rxMethod<AutofillCommand>(
        pipe(
          tap(() => patchState(store, { isAutofilling: true })),
          switchMap(({ currentModel, id }) =>
            kinopoiskApi.getMovieAutofill(id).pipe(
              tap((result) => {
                patchState(store, { isAutofilling: false, seed: mergeMovieAutofill(currentModel(), result) });
                showToast('success', 'movieEditor.toasts.autofillSuccessTitle', 'movieEditor.toasts.autofillSuccessMessage');
              }),
              catchError(() => {
                patchState(store, { isAutofilling: false });
                showToast('error', 'movieEditor.toasts.autofillErrorTitle', 'movieEditor.toasts.autofillErrorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const save = rxMethod<MediaDto>(
        pipe(
          filter(() => !store.isSaving()),
          tap(() => patchState(store, { isSaving: true })),
          switchMap((movie) =>
            (store.mode() === 'add' ? galleryApi.addMovie(movie) : galleryApi.updateMovie(movie)).pipe(
              tap((savedMovie) => {
                patchState(store, { isSaving: false });
                showToast('success', 'movieEditor.toasts.saveSuccessTitle', 'movieEditor.toasts.saveSuccessMessage');
                const id = savedMovie.id || movie.id;
                void router.navigate(id ? ['/gallery/movies', id] : ['/gallery/movies'], {
                  queryParamsHandling: 'preserve',
                });
              }),
              catchError((error: unknown) => {
                patchState(store, { isSaving: false });
                if (store.mode() === 'add' && isDuplicateMovieConflict(error)) {
                  showToast('error', 'movieEditor.toasts.duplicateErrorTitle', 'movieEditor.toasts.duplicateErrorMessage');
                } else {
                  showToast('error', 'movieEditor.toasts.saveErrorTitle', 'movieEditor.toasts.saveErrorMessage');
                }
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      return {
        autofill,
        discard(): void {
          if (store.mode() === 'add') {
            location.back();
            return;
          }
          void router.navigate(['/gallery/movies', store.movieId()], { queryParamsHandling: 'preserve' });
        },
        loadMovie,
        retry(): void {
          if (store.movieId()) loadMovie(store.movieId());
        },
        save,
        setMode(mode: MovieEditorMode): void {
          patchState(store, { mode });
          if (mode === 'add') patchState(store, { seed: createEmptyMovieEditorModel() });
        },
      };
    },
  ),
  withHooks((store, route = inject(ActivatedRoute)) => ({
    onInit() {
      const mode = route.snapshot.data['mode'] === 'edit' ? 'edit' : 'add';
      store.setMode(mode);
      if (mode === 'edit') {
        store.loadMovie(
          route.paramMap.pipe(
            map((params) => params.get('id')?.trim() ?? ''),
            filter(Boolean),
            distinctUntilChanged(),
          ),
        );
      }
    },
  })),
);

function isDuplicateMovieConflict(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 409) return false;
  if (typeof error.error !== 'object' || error.error === null || Array.isArray(error.error)) return false;
  const payload = error.error as Record<string, unknown>;
  return payload['message'] === 'A movie with the same name already exists.' && payload['statusCode'] === 409;
}
