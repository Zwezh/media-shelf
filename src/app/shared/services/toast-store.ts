import { DestroyRef, Service, inject, signal } from '@angular/core';
import { ToastId, ToastMessage, ToastOptions, ToastType } from '@msh-shared/models/toast.model';

const DEFAULT_TOAST_DELAY = 5_000;

@Service()
export class ToastStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastSignal = signal<readonly ToastMessage[]>([]);
  private readonly timers = new Map<ToastId, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  readonly toasts = this.toastSignal.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => this.cancelAllTimers());
  }

  show(options: ToastOptions): ToastId {
    const id = ++this.nextId;
    const delay = this.normalizeDelay(options.delay);
    const toast: ToastMessage = {
      id,
      title: options.title,
      message: options.message,
      type: options.type ?? 'info',
      closable: options.closable ?? true,
      autoHide: options.autoHide ?? false,
      delay,
      action: options.action,
    };

    this.toastSignal.update((toasts) => [...toasts, toast]);

    if (toast.autoHide) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), delay),
      );
    }

    return id;
  }

  info(options: Omit<ToastOptions, 'type'>): ToastId {
    return this.showType('info', options);
  }

  success(options: Omit<ToastOptions, 'type'>): ToastId {
    return this.showType('success', options);
  }

  warning(options: Omit<ToastOptions, 'type'>): ToastId {
    return this.showType('warning', options);
  }

  error(options: Omit<ToastOptions, 'type'>): ToastId {
    return this.showType('error', options);
  }

  dismiss(id: ToastId): void {
    this.cancelTimer(id);
    this.toastSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  activateAction(id: ToastId): void {
    const action = this.toastSignal().find((toast) => toast.id === id)?.action;
    if (!action) return;

    try {
      action.handler();
    } finally {
      this.dismiss(id);
    }
  }

  clear(): void {
    this.cancelAllTimers();
    this.toastSignal.set([]);
  }

  private showType(type: ToastType, options: Omit<ToastOptions, 'type'>): ToastId {
    return this.show({ ...options, type });
  }

  private normalizeDelay(delay: number | undefined): number {
    return delay !== undefined && Number.isFinite(delay) && delay > 0 ? delay : DEFAULT_TOAST_DELAY;
  }

  private cancelTimer(id: ToastId): void {
    const timer = this.timers.get(id);
    if (timer === undefined) return;

    clearTimeout(timer);
    this.timers.delete(id);
  }

  private cancelAllTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}
