import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { ToastStore } from '@msh-shared/services/toast-store';
import { GetStatisticsQuery } from '../application/get-statistics.query';
import { ScanStatisticsUseCase } from '../application/scan-statistics.use-case';
import { StatisticsStore } from './statistics.store';
import { emptyStatistics } from '../testing/statistics.fixture';
import type { StatisticsSnapshot } from '../models/statistics-snapshot';
function setup(snapshot: StatisticsSnapshot | null = null) {
  const read = vi.fn(() => of(snapshot));
  const scan = vi.fn(() => of(emptyStatistics));
  const feedback = { success: vi.fn(), error: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      StatisticsStore,
      { provide: GetStatisticsQuery, useValue: { execute: read } },
      { provide: ScanStatisticsUseCase, useValue: { execute: scan } },
      { provide: ToastStore, useValue: feedback },
      { provide: TranslateService, useValue: { instant: (key: string) => key } },
    ],
  });
  return { store: TestBed.inject(StatisticsStore), read, scan, feedback };
}
afterEach(() => TestBed.resetTestingModule());
it('reads saved data once without calculating on entry and accepts a scanned empty library', () => {
  const { store, read, scan } = setup(emptyStatistics);
  expect(store.snapshot()).toEqual(emptyStatistics);
  expect(store.status()).toBe('ready');
  expect(read).toHaveBeenCalledOnce();
  expect(scan).not.toHaveBeenCalled();
});
it('scan replaces state directly and blocks duplicate submissions without follow-up GET', async () => {
  const { store, read, scan, feedback } = setup();
  const pending = new Subject<StatisticsSnapshot>();
  scan.mockReturnValue(pending);
  const result = store.scan();
  await store.scan();
  expect(scan).toHaveBeenCalledOnce();
  expect(store.status()).toBe('scanning');
  pending.next(emptyStatistics);
  pending.complete();
  await result;
  expect(store.snapshot()).toEqual(emptyStatistics);
  expect(store.status()).toBe('ready');
  expect(read).toHaveBeenCalledOnce();
  expect(feedback.success).toHaveBeenCalledOnce();
});
it('failed rescans retain prior results', async () => {
  const { store, scan, feedback } = setup(emptyStatistics);
  scan.mockReturnValue(throwError(() => Error('offline')));
  await store.scan();
  expect(store.snapshot()).toEqual(emptyStatistics);
  expect(store.status()).toBe('ready');
  expect(feedback.error).toHaveBeenCalledOnce();
});
it('read retry does not invoke scan', () => {
  const { store, read, scan } = setup();
  read.mockReturnValueOnce(throwError(() => Error('offline')));
  store.load();
  expect(store.status()).toBe('error');
  store.load();
  expect(store.snapshot()).toBeNull();
  expect(store.status()).toBe('ready');
  expect(scan).not.toHaveBeenCalled();
});

it('a failed first scan retains the never-scanned state', async () => {
  const { store, scan, feedback } = setup();
  scan.mockReturnValue(throwError(() => Error('offline')));
  await store.scan();
  expect(store.snapshot()).toBeNull();
  expect(store.status()).toBe('ready');
  expect(feedback.error).toHaveBeenCalledOnce();
});
