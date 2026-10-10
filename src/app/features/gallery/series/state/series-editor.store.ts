import { GetWishlistTitleQuery } from '../../wishlist/application/get-wishlist-title.query';
import { computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, filter, map, pipe, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { AppError } from '@msh-core/http/app-error';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { AutofillTitleUseCase } from '../../catalog/application/autofill-title.use-case';
import type { SeriesDraft } from '../../catalog/models/title';
import { GetSeriesTitleQuery } from '../application/get-series-title.query';
import { SaveSeriesUseCase } from '../application/save-series.use-case';
import { createSeriesEditorModel, type SeriesEditorModel } from '../models/series-editor.model';
import { toSeriesDraft, toSeriesEditor } from '../utils/series-editor.converter';

type EditorState = {
  readonly mode: 'add' | 'edit';
  readonly wishlistId: string;
  readonly id: string;
  readonly seed: SeriesEditorModel;
  readonly hasLoadError: boolean;
  readonly operation: 'idle' | 'loading' | 'saving' | 'autofilling';
};
export const SeriesEditorStore = signalStore(
  withState<EditorState>({
    mode: 'add',
    id: '',
    wishlistId: '',
    seed: createSeriesEditorModel(),
    hasLoadError: false,
    operation: 'idle',
  }),
  withComputed((store) => ({ isBusy: computed(() => store.operation() !== 'idle') })),
  withMethods(
    (
      store,
      query = inject(GetSeriesTitleQuery),
      wishlistQuery = inject(GetWishlistTitleQuery),
      settings = inject(SettingsStore),
      saveSeries = inject(SaveSeriesUseCase),
      autofillTitle = inject(AutofillTitleUseCase),
      router = inject(Router),
      feedback = inject(GalleryFeedback),
    ) => {
      const routeChanged = new Subject<void>();
      const load = rxMethod<string>(
        pipe(
          tap((id) => {
            routeChanged.next();
            patchState(store, { id, operation: 'loading', hasLoadError: false, seed: createSeriesEditorModel() });
          }),
          switchMap((id) =>
            query.execute(id).pipe(
              tap((title) => patchState(store, { seed: toSeriesEditor(title), operation: 'idle' })),
              catchError(() => {
                patchState(store, { operation: 'idle', hasLoadError: true });
                return EMPTY;
              }),
            ),
          ),
        ),
      );
      const loadWishlist = rxMethod<string>(
        pipe(
          tap((wishlistId) => {
            routeChanged.next();
            patchState(store, { wishlistId, operation: 'loading', hasLoadError: false });
          }),
          switchMap((id) => {
            if (!id) {
              patchState(store, { wishlistId: '', seed: createSeriesEditorModel(), operation: 'idle' });
              return EMPTY;
            }
            return wishlistQuery.execute(id).pipe(
              tap((title) => {
                if (title.kind !== 'series') throw new AppError('validation', 'Wrong wishlist kind');
                patchState(store, {
                  seed: { ...toSeriesEditor(title), addedDate: new Date().toISOString().slice(0, 10) },
                  operation: 'idle',
                });
              }),
              catchError(() => {
                patchState(store, { operation: 'idle', hasLoadError: true });
                feedback.error('wishlist.details', 'wishlist.editorError');
                return EMPTY;
              }),
            );
          }),
        ),
      );
      const save = rxMethod<SeriesDraft>(
        pipe(
          filter(() => !store.isBusy() && !store.hasLoadError()),
          tap(() => patchState(store, { operation: 'saving' })),
          switchMap((draft) =>
            saveSeries
              .execute(
                store.mode() === 'add'
                  ? { mode: 'add', draft, ...(store.wishlistId() ? { wishlistId: store.wishlistId() } : {}) }
                  : { mode: 'edit', id: store.id(), draft },
              )
              .pipe(
                takeUntil(routeChanged),
                tap((title) => {
                  patchState(store, { operation: 'idle' });
                  feedback.success('seriesEditor.title', 'seriesEditor.saved');
                  void router.navigate(['/gallery/series', title.id], { queryParamsHandling: 'preserve' });
                }),
                catchError((error: unknown) => {
                  patchState(store, { operation: 'idle' });
                  feedback.error(
                    'seriesEditor.title',
                    error instanceof AppError && error.kind === 'conflict' ? 'seriesEditor.conflict' : 'seriesEditor.saveError',
                  );
                  return EMPTY;
                }),
              ),
          ),
        ),
      );
      const autofill = rxMethod<{ id: string; currentModel: () => SeriesEditorModel }>(
        pipe(
          filter(() => !store.isBusy() && !store.hasLoadError()),
          tap(() => patchState(store, { operation: 'autofilling' })),
          switchMap(({ id, currentModel }) =>
            autofillTitle
              .execute(id, () => toSeriesDraft(currentModel()))
              .pipe(
                takeUntil(routeChanged),
                tap((draft) => {
                  const previous = currentModel();
                  const seed = toSeriesEditor(draft, previous);
                  const qualityId = settings.qualityOptions().find((option) => option.default)?.id ?? '';
                  const extensionId = settings.extensionOptions().find((option) => option.default)?.id ?? '';
                  patchState(store, {
                    seed: {
                      ...seed,
                      seasons: seed.seasons.map((season) =>
                        previous.seasons.some((existing) => existing.seasonNumber === season.seasonNumber)
                          ? season
                          : { ...season, isAvailable: true, qualityId, extensionId },
                      ),
                    },
                    operation: 'idle',
                  });
                  feedback.success('seriesEditor.title', 'seriesEditor.autofilled');
                }),
                catchError(() => {
                  patchState(store, { operation: 'idle' });
                  feedback.error('seriesEditor.title', 'seriesEditor.autofillError');
                  return EMPTY;
                }),
              ),
          ),
        ),
      );
      return {
        load,
        loadWishlist,
        save,
        autofill,
        retry(): void {
          if (store.wishlistId()) loadWishlist(store.wishlistId());
          else if (store.id()) load(store.id());
        },
        discard(): void {
          if (!store.isBusy())
            void router.navigate(store.mode() === 'edit' ? ['/gallery/series', store.id()] : ['/gallery/series'], {
              queryParamsHandling: 'preserve',
            });
        },
        initialize(mode: 'add' | 'edit'): void {
          patchState(store, { mode, ...(mode === 'add' ? { seed: createSeriesEditorModel() } : {}) });
        },
      };
    },
  ),
  withHooks((store, route = inject(ActivatedRoute)) => ({
    onInit(): void {
      const mode = route.snapshot.data['mode'] === 'edit' ? 'edit' : 'add';
      store.initialize(mode);
      if (mode === 'add') {
        store.loadWishlist(
          route.queryParamMap.pipe(
            map((params) => params.get('wishlistId') ?? ''),
            distinctUntilChanged(),
          ),
        );
      }
      if (mode === 'edit')
        store.load(
          route.paramMap.pipe(
            map((params) => params.get('id') ?? ''),
            filter(Boolean),
            distinctUntilChanged(),
          ),
        );
    },
  })),
);
