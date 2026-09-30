import { Location } from '@angular/common';
import { computed, inject, type Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, filter, map, pipe, switchMap, tap } from 'rxjs';
import { AppError } from '@msh-core/http/app-error';
import { AutofillMovieUseCase } from '../../movies/application/autofill-movie.use-case';
import { LoadMovieEditorQuery } from '../../movies/application/load-movie-editor.query';
import { MovieFeedback } from '../../movies/ui/movie-feedback';
import { SaveMovieUseCase } from '../../movies/application/save-movie.use-case';
import { type MovieEditorModel, type MovieEditorMode, createEmptyMovieEditorModel } from '../models/movie-editor.model';

type AutofillCommand = {
  readonly currentModel: Signal<MovieEditorModel>;
  readonly id: number;
};

type MovieEditorState = {
  readonly hasLoadError: boolean;
  readonly mode: MovieEditorMode;
  readonly movieId: string;
  readonly operation: EditorOperation;
  readonly seed: MovieEditorModel;
};

type EditorOperation = 'autofilling' | 'idle' | 'loading' | 'saving';

const initialState: MovieEditorState = {
  hasLoadError: false,
  mode: 'add',
  movieId: '',
  operation: 'idle',
  seed: createEmptyMovieEditorModel(),
};

export const MovieEditorStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    breadcrumbTitle: computed(() => (store.mode() === 'add' ? '' : store.seed().name)),
    isAutofilling: computed(() => store.operation() === 'autofilling'),
    isBusy: computed(() => store.operation() !== 'idle'),
    isLoading: computed(() => store.operation() === 'loading'),
    isSaving: computed(() => store.operation() === 'saving'),
  })),
  withMethods(
    (
      store,
      autofillMovie = inject(AutofillMovieUseCase),
      feedback = inject(MovieFeedback),
      loadMovieEditor = inject(LoadMovieEditorQuery),
      location = inject(Location),
      router = inject(Router),
      saveMovie = inject(SaveMovieUseCase),
    ) => {
      const loadMovie = rxMethod<string>(
        pipe(
          filter(() => store.operation() === 'idle'),
          tap((movieId) => patchState(store, { hasLoadError: false, movieId, operation: 'loading' })),
          switchMap((movieId) =>
            loadMovieEditor.execute(movieId).pipe(
              tap((seed) => patchState(store, { hasLoadError: false, operation: 'idle', seed })),
              catchError(() => {
                patchState(store, { hasLoadError: true, operation: 'idle' });
                feedback.error('movieEditor.toasts.loadErrorTitle', 'movieEditor.toasts.loadErrorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const autofill = rxMethod<AutofillCommand>(
        pipe(
          filter(() => store.operation() === 'idle'),
          tap(() => patchState(store, { operation: 'autofilling' })),
          switchMap(({ currentModel, id }) =>
            autofillMovie.execute(id, currentModel).pipe(
              tap((seed) => {
                patchState(store, { operation: 'idle', seed });
                feedback.success('movieEditor.toasts.autofillSuccessTitle', 'movieEditor.toasts.autofillSuccessMessage');
              }),
              catchError(() => {
                patchState(store, { operation: 'idle' });
                feedback.error('movieEditor.toasts.autofillErrorTitle', 'movieEditor.toasts.autofillErrorMessage');
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const save = rxMethod<MovieEditorModel>(
        pipe(
          filter(() => store.operation() === 'idle'),
          tap(() => patchState(store, { operation: 'saving' })),
          switchMap((movie) =>
            saveMovie.execute(store.mode(), movie).pipe(
              tap((savedMovie) => {
                patchState(store, { operation: 'idle' });
                feedback.success('movieEditor.toasts.saveSuccessTitle', 'movieEditor.toasts.saveSuccessMessage');
                const id = savedMovie.id || movie.id;
                void router.navigate(id ? ['/gallery/movies', id] : ['/gallery/movies'], {
                  queryParamsHandling: 'preserve',
                });
              }),
              catchError((error: unknown) => {
                patchState(store, { operation: 'idle' });
                if (store.mode() === 'add' && error instanceof AppError && error.kind === 'conflict') {
                  feedback.error('movieEditor.toasts.duplicateErrorTitle', 'movieEditor.toasts.duplicateErrorMessage');
                } else {
                  feedback.error('movieEditor.toasts.saveErrorTitle', 'movieEditor.toasts.saveErrorMessage');
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
    onInit(): void {
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
