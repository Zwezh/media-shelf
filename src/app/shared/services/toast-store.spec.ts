import { TestBed } from '@angular/core/testing';
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

  it('adds typed toasts in creation order with closable defaults', () => {
    store.info({ title: 'Indexed' });
    store.success({ title: 'Saved' });
    store.warning({ title: 'Low space' });
    store.error({ title: 'Import failed' });

    expect(store.toasts().map(({ type }) => type)).toEqual(['info', 'success', 'warning', 'error']);
    expect(store.toasts().every(({ closable }) => closable)).toBe(true);
  });

  it('auto-hides after the default 500 ms delay', () => {
    store.show({ title: 'Temporary', autoHide: true });

    vi.advanceTimersByTime(499);
    expect(store.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(store.toasts()).toHaveLength(0);
  });

  it('uses a custom delay and normalizes non-positive delays to the default', () => {
    store.show({ title: 'Custom', autoHide: true, delay: 1_000 });
    store.show({ title: 'Normalized', autoHide: true, delay: 0 });

    vi.advanceTimersByTime(500);
    expect(store.toasts().map(({ title }) => title)).toEqual(['Custom']);

    vi.advanceTimersByTime(500);
    expect(store.toasts()).toHaveLength(0);
  });

  it('dismisses one toast and clears all remaining timers', () => {
    const firstId = store.show({ title: 'First', autoHide: true, delay: 1_000 });
    store.show({ title: 'Second', autoHide: true, delay: 1_000 });

    store.dismiss(firstId);
    expect(store.toasts().map(({ title }) => title)).toEqual(['Second']);

    store.clear();
    vi.runAllTimers();
    expect(store.toasts()).toHaveLength(0);
  });

  it('runs an action and dismisses its toast', () => {
    const handler = vi.fn();
    const id = store.show({ title: 'Ready', action: { label: 'Open', handler } });

    store.activateAction(id);

    expect(handler).toHaveBeenCalledOnce();
    expect(store.toasts()).toHaveLength(0);
  });
});
