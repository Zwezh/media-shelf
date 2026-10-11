import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Service()
export class Pwa {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly destroyRef = inject(DestroyRef);
  private readonly updates = inject(SwUpdate, { optional: true });
  private readonly installPrompt = signal<InstallPromptEvent | null>(null);
  private readonly standalone = this.window?.matchMedia?.('(display-mode: standalone)');
  private readonly installedState = signal(
    this.standalone?.matches === true ||
      (this.window?.navigator as (Navigator & { standalone?: boolean }) | undefined)?.standalone === true,
  );
  private readonly onlineState = signal(this.window?.navigator.onLine !== false);
  private readonly readyState = signal(false);
  private readonly recoveryState = signal(false);
  private readonly installingState = signal(false);
  private readonly installErrorState = signal(false);

  readonly installed = this.installedState.asReadonly();
  readonly online = this.onlineState.asReadonly();
  readonly updateReady = this.readyState.asReadonly();
  readonly recoveryRequired = this.recoveryState.asReadonly();
  readonly installing = this.installingState.asReadonly();
  readonly installError = this.installErrorState.asReadonly();
  readonly canInstall = computed(() => !!this.installPrompt() && !this.installed());

  constructor() {
    const onInstallPrompt = (event: Event): void => {
      event.preventDefault();
      this.installPrompt.set(event as InstallPromptEvent);
      this.installErrorState.set(false);
    };
    const onInstalled = (): void => {
      this.installedState.set(true);
      this.installPrompt.set(null);
    };
    const onDisplayChange = (event: MediaQueryListEvent): void => this.installedState.set(event.matches);
    const onOnline = (): void => this.onlineState.set(true);
    const onOffline = (): void => this.onlineState.set(false);
    const onVisible = (): void => {
      if (this.window?.document.visibilityState === 'visible' && this.online() && this.updates?.isEnabled)
        void this.updates.checkForUpdate().catch(() => undefined);
    };
    this.window?.addEventListener('beforeinstallprompt', onInstallPrompt);
    this.window?.addEventListener('appinstalled', onInstalled);
    this.window?.addEventListener('online', onOnline);
    this.window?.addEventListener('offline', onOffline);
    this.window?.document.addEventListener('visibilitychange', onVisible);
    this.standalone?.addEventListener('change', onDisplayChange);
    this.destroyRef.onDestroy(() => {
      this.window?.removeEventListener('beforeinstallprompt', onInstallPrompt);
      this.window?.removeEventListener('appinstalled', onInstalled);
      this.window?.removeEventListener('online', onOnline);
      this.window?.removeEventListener('offline', onOffline);
      this.window?.document.removeEventListener('visibilitychange', onVisible);
      this.standalone?.removeEventListener('change', onDisplayChange);
    });
    if (this.updates?.isEnabled) {
      this.updates.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        if (event.type === 'VERSION_READY') this.readyState.set(true);
      });
      this.updates.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.recoveryState.set(true));
    }
  }

  async install(): Promise<void> {
    const prompt = this.installPrompt();
    if (!prompt || this.installing() || this.installed()) return;
    this.installingState.set(true);
    this.installErrorState.set(false);
    this.installPrompt.set(null);
    try {
      await prompt.prompt();
      await prompt.userChoice;
      // appinstalled confirms installation; accepting the prompt alone does not.
    } catch {
      this.installErrorState.set(true);
    } finally {
      this.installingState.set(false);
    }
  }

  reload(): void {
    this.window?.location.reload();
  }
}
