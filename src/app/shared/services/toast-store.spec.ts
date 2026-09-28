import { TestBed } from '@angular/core/testing';
import { TOAST_AUTO_HIDE_DELAY_MS } from '@msh-shared/config/toast';
import { ToastStore } from './toast-store';

describe('ToastStore', () => {
  let store: ToastStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = TestBed.inject(ToastStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('adds typed toasts with closable, auto-hide, and type-specific delay defaults', () => {
    store.info({ title: 'Indexed' });
    store.success({ title: 'Saved' });
    store.warning({ title: 'Low space' });
    store.error({ title: 'Import failed' });

    expect(store.toasts().map(({ type }) => type)).toEqual(['info', 'success', 'warning', 'error']);
    expect(store.toasts().every(({ closable }) => closable)).toBe(true);
    expect(store.toasts().every(({ autoHide }) => autoHide)).toBe(true);
    expect(store.toasts().map(({ delay }) => delay)).toEqual([
      TOAST_AUTO_HIDE_DELAY_MS.default,
      TOAST_AUTO_HIDE_DELAY_MS.success,
      TOAST_AUTO_HIDE_DELAY_MS.default,
      TOAST_AUTO_HIDE_DELAY_MS.error,
    ]);
  });

  it('auto-hides after the default 5 second delay', () => {
    store.show({ title: 'Temporary' });

    vi.advanceTimersByTime(4_999);
    expect(store.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(store.toasts()).toHaveLength(0);
  });

  it('uses a custom delay and normalizes non-positive delays to the default', () => {
    store.show({ title: 'Custom', delay: 1_000 });
    store.show({ title: 'Normalized', delay: 0 });

    vi.advanceTimersByTime(1_000);
    expect(store.toasts().map(({ title }) => title)).toEqual(['Normalized']);

    vi.advanceTimersByTime(4_000);
    expect(store.toasts()).toHaveLength(0);
  });

  it('dismisses one toast and clears all remaining timers', () => {
    const firstId = store.show({ title: 'First', delay: 1_000 });
    store.show({ title: 'Second', delay: 1_000 });

    store.dismiss(firstId);
    expect(store.toasts().map(({ title }) => title)).toEqual(['Second']);

    store.clear();
    vi.runAllTimers();
    expect(store.toasts()).toHaveLength(0);
  });

  it('keeps a toast visible when auto-hide is explicitly disabled', () => {
    store.show({ title: 'Persistent', autoHide: false });

    vi.advanceTimersByTime(TOAST_AUTO_HIDE_DELAY_MS.default);

    expect(store.toasts()).toHaveLength(1);
  });

  it('runs an action and dismisses its toast', () => {
    const handler = vi.fn();
    const id = store.show({ title: 'Ready', action: { label: 'Open', handler } });

    store.activateAction(id);

    expect(handler).toHaveBeenCalledOnce();
    expect(store.toasts()).toHaveLength(0);
  });
});
