import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, exhaustMap, firstValueFrom, pipe, tap } from 'rxjs';
import { GetStatisticsQuery } from '../application/get-statistics.query';
import { ScanStatisticsUseCase } from '../application/scan-statistics.use-case';
import type { StatisticsSnapshot } from '../models/statistics-snapshot';
import { ToastStore } from '@msh-shared/services/toast-store';
import { TranslateService } from '@ngx-translate/core';

export const StatisticsStore = signalStore(
  withState<{ status: 'loading' | 'ready' | 'scanning' | 'error'; snapshot: StatisticsSnapshot | null }>({
    status: 'loading',
    snapshot: null,
  }),
  withMethods(
    (
      store,
      query = inject(GetStatisticsQuery),
      scan = inject(ScanStatisticsUseCase),
      toasts = inject(ToastStore),
      translate = inject(TranslateService),
      owner = inject(DestroyRef),
    ) => {
      const load = rxMethod<void>(
        pipe(
          exhaustMap(() => {
            patchState(store, { status: 'loading' });
            return query.execute().pipe(
              tap((snapshot) => patchState(store, { snapshot, status: 'ready' })),
              catchError(() => {
                patchState(store, { status: 'error' });
                return EMPTY;
              }),
            );
          }),
        ),
      );
      return {
        load,
        async scan(): Promise<void> {
          if (store.status() !== 'ready') return;
          patchState(store, { status: 'scanning' });
          try {
            const snapshot = await firstValueFrom(scan.execute().pipe(takeUntilDestroyed(owner)));
            patchState(store, { snapshot, status: 'ready' });
            toasts.success({
              title: String(translate.instant('statistics.title')),
              message: String(translate.instant('statistics.scanSuccess')),
            });
          } catch {
            if (!owner.destroyed) {
              patchState(store, { status: 'ready' });
              toasts.error({
                title: String(translate.instant('statistics.title')),
                message: String(translate.instant('statistics.scanError')),
              });
            }
          }
        },
      };
    },
  ),
  withHooks((store) => ({
    onInit(): void {
      store.load();
    },
  })),
);
