import { computed, inject, InjectionToken } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, map, of, pipe, switchMap, tap, timer } from 'rxjs';
import { type Media } from '../models/media';
import { GetMoviesQuery } from '../movies/application/get-movies.query';
import { DEFAULT_MOVIES_PARAMS } from '../utils/movies-params';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_RESULT_LIMIT = 6;

export const QUICK_SEARCH_DEBOUNCE = new InjectionToken<number>('QUICK_SEARCH_DEBOUNCE', {
  factory: () => SEARCH_DEBOUNCE_MS,
});

type QuickSearchStatus = 'idle' | 'loading' | 'loaded' | 'error';

type QuickSearchState = {
  readonly isOpen: boolean;
  readonly media: readonly Media[];
  readonly query: string;
  readonly status: QuickSearchStatus;
};

const initialState: QuickSearchState = {
  isOpen: false,
  media: [],
  query: '',
  status: 'idle',
};

export const QuickSearchStore = signalStore(
  withState(initialState),
  withComputed(({ media, query, status }) => ({
    canApply: computed(() => status() === 'loaded' && media().length > 0 && query().trim().length > 0),
    hasNoResults: computed(() => status() === 'loaded' && media().length === 0),
    isLoading: computed(() => status() === 'loading'),
  })),
  withMethods((store, getMovies = inject(GetMoviesQuery), debounceMs = inject(QUICK_SEARCH_DEBOUNCE)) => {
    const search = rxMethod<string>(
      pipe(
        map((query) => ({ query, normalizedQuery: query.trim() })),
        switchMap(({ query, normalizedQuery }) => {
          if (!normalizedQuery) {
            patchState(store, initialState);
            return EMPTY;
          }

          patchState(store, { isOpen: true, media: [], query, status: 'loading' });

          return timer(debounceMs).pipe(
            switchMap(() =>
              getMovies
                .execute({
                  ...DEFAULT_MOVIES_PARAMS,
                  pageSize: SEARCH_RESULT_LIMIT,
                  search: normalizedQuery,
                })
                .pipe(
                  map(({ media }) => ({ kind: 'loaded' as const, media })),
                  catchError(() => of({ kind: 'error' as const, media: [] })),
                ),
            ),
          );
        }),
        tap((result) => {
          patchState(store, {
            media: result.media,
            status: result.kind,
          });
        }),
      ),
    );

    return {
      close(): void {
        patchState(store, { isOpen: false });
      },
      open(): void {
        if (store.query().trim()) patchState(store, { isOpen: true });
      },
      search,
    };
  }),
);
