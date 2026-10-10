import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, type Observable, of, Subject, throwError } from 'rxjs';
import { AppError } from '@msh-core/http/app-error';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { WISHLIST_MUTATION_TEST_PROVIDERS } from '@msh/testing/wishlist-testing';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { toTitle } from '../../catalog/utils/title.converter';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import type { Title } from '../../catalog/models/title';
import { GetWishlistTitleQuery } from '../application/get-wishlist-title.query';
import { CreateWishlistFromKinopoiskUseCase } from '../application/create-wishlist-from-kinopoisk.use-case';
import { RefreshWishlistUseCase } from '../application/refresh-wishlist.use-case';
import { DeleteWishlistUseCase } from '../application/delete-wishlist.use-case';
import { WishlistDetailsStore } from './wishlist-details.store';
import { WishlistAddDialog } from '../components/wishlist-add-dialog';

const title = toTitle(seriesDto);
afterEach(() => TestBed.resetTestingModule());
function detailsSetup() {
  const ids = new BehaviorSubject(convertToParamMap({ id: title.id }));
  const refresh = vi.fn((): Observable<Title> => of({ ...title, title: 'Fresh' }));
  const remove = vi.fn(() => of(undefined));
  const navigate = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      ...WISHLIST_MUTATION_TEST_PROVIDERS,
      WishlistDetailsStore,
      { provide: GalleryFeedback, useValue: { success: vi.fn(), error: vi.fn() } },
      { provide: ActivatedRoute, useValue: { paramMap: ids } },
      { provide: Router, useValue: { navigate } },
      { provide: GetWishlistTitleQuery, useValue: { execute: vi.fn((id: string) => of({ ...title, id })) } },
      { provide: RefreshWishlistUseCase, useValue: { execute: refresh } },
      { provide: DeleteWishlistUseCase, useValue: { execute: remove } },
    ],
  });
  return { store: TestBed.inject(WishlistDetailsStore), refresh, remove, navigate, ids };
}
it('refreshes details in place, shares pending protection and keeps data on failure', async () => {
  const { store, refresh } = detailsSetup();
  const pending = new Subject<Title>();
  refresh.mockReturnValueOnce(pending);
  const first = store.refresh();
  await store.refresh();
  expect(refresh).toHaveBeenCalledOnce();
  expect(store.pending()).toBe(true);
  pending.next({ ...title, title: 'Fresh' });
  await first;
  expect(store.title()?.title).toBe('Fresh');
  expect(store.pending()).toBe(false);
  refresh.mockReturnValueOnce(throwError(() => new AppError('conflict', 'Changed')));
  await store.refresh();
  expect(store.title()?.title).toBe('Fresh');
  expect(TestBed.inject(GalleryFeedback).error).toHaveBeenCalledWith('wishlist.refresh', 'wishlist.conflict');
});
it('discards delayed detail refresh after navigating to a different item', async () => {
  const { store, refresh, ids } = detailsSetup();
  const pending = new Subject<Title>();
  refresh.mockReturnValueOnce(pending);
  const request = store.refresh();
  ids.next(convertToParamMap({ id: 'another' }));
  pending.next({ ...title, title: 'Stale' });
  await request;
  expect(store.title()?.id).toBe('another');
  expect(store.title()?.title).not.toBe('Stale');
});
it('leaves details on failed deletion and navigates only after server success', async () => {
  const { store, remove, navigate } = detailsSetup();
  remove.mockReturnValueOnce(throwError(() => new Error('offline')));
  await store.deleteItem();
  expect(store.title()?.id).toBe(title.id);
  expect(navigate).not.toHaveBeenCalled();
  await store.deleteItem();
  expect(navigate).toHaveBeenCalledWith(['/gallery/wishlist'], { queryParamsHandling: 'preserve' });
});
async function dialogSetup() {
  const execute = vi.fn();
  const close = vi.fn();
  const feedback = { success: vi.fn(), error: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      ...provideI18nTesting(),
      { provide: CreateWishlistFromKinopoiskUseCase, useValue: { execute } },
      { provide: FloatingPanelRef, useValue: { close } },
      { provide: GalleryFeedback, useValue: feedback },
    ],
  });
  const fixture = TestBed.createComponent(WishlistAddDialog);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const input = root.querySelector<HTMLInputElement>('input')!;
  const submit = (): void => {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };
  const fill = (value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  return { fixture, root, input, execute, close, feedback, submit, fill };
}
it('validates the one-field dialog and navigates through its created-ID result only after success', async () => {
  const { fixture, input, execute, close, feedback, submit, fill } = await dialogSetup();
  fill('abc');
  submit();
  await fixture.whenStable();
  expect(execute).not.toHaveBeenCalled();
  expect(input.getAttribute('aria-invalid')).toBe('true');
  const response = new Subject<string>();
  execute.mockReturnValue(response);
  fill('6058297');
  submit();
  submit();
  expect(execute).toHaveBeenCalledOnce();
  expect(close).not.toHaveBeenCalled();
  response.next('new-id');
  await fixture.whenStable();
  expect(close).toHaveBeenCalledWith('new-id');
  expect(feedback.success).toHaveBeenCalledWith('wishlist.add', 'wishlist.added');
});
it('preserves entered ID and lets the user retry failed dialog submission', async () => {
  const { fixture, input, execute, close, feedback, submit, fill } = await dialogSetup();
  execute.mockReturnValueOnce(throwError(() => new AppError('conflict', 'Duplicate'))).mockReturnValueOnce(of('created'));
  fill('123');
  submit();
  await fixture.whenStable();
  expect(input.value).toBe('123');
  expect(close).not.toHaveBeenCalled();
  expect(feedback.error).toHaveBeenCalledWith('wishlist.add', 'wishlist.conflict');
  submit();
  await fixture.whenStable();
  expect(close).toHaveBeenCalledWith('created');
});
