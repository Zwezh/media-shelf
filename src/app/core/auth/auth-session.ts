import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { BrowserStorage } from '@msh-core/storage/browser-storage';
import { StorageKey } from '@msh-core/storage/storage-key';

const MAX_TIMER_DELAY_MS = 2_147_483_647;

@Service()
export class AuthSession {
  private readonly destroyRef = inject(DestroyRef);
  private readonly storage = inject(BrowserStorage);
  private readonly token = signal('');
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== '');

  constructor() {
    this.restoreSession();
    this.destroyRef.onDestroy(() => this.clearExpiryTimer());
  }

  start(accessToken: string): void {
    const expiresAt = jwtExpiryTime(accessToken);
    if (expiresAt === undefined || expiresAt <= Date.now()) throw new TypeError('Invalid or expired access token');

    this.clearExpiryTimer();
    this.token.set(accessToken);
    this.storage.set(StorageKey.Token, accessToken);
    this.scheduleExpiry(expiresAt);
  }

  signOut(): void {
    this.clearSession();
  }

  private scheduleExpiry(expiresAt: number): void {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      this.clearSession();
      return;
    }

    this.expiryTimer = setTimeout(() => this.scheduleExpiry(expiresAt), Math.min(remaining, MAX_TIMER_DELAY_MS));
  }

  private clearSession(): void {
    this.clearExpiryTimer();
    this.token.set('');
    this.storage.remove(StorageKey.Token);
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer === undefined) return;
    clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
  }

  private restoreSession(): void {
    const storedToken = this.storage.get(StorageKey.Token);
    if (!storedToken) return;

    try {
      this.start(storedToken);
    } catch {
      this.storage.remove(StorageKey.Token);
    }
  }
}

function jwtExpiryTime(token: string): number | undefined {
  const segments = token.split('.');
  if (segments.length !== 3 || segments.some((segment) => !segment)) return undefined;

  try {
    const payload = segments[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? '';
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const claims: unknown = JSON.parse(globalThis.atob(paddedPayload));
    if (typeof claims !== 'object' || claims === null || Array.isArray(claims)) return undefined;
    const expiresAt = (claims as Record<string, unknown>)['exp'];
    return typeof expiresAt === 'number' && Number.isFinite(expiresAt) ? expiresAt * 1_000 : undefined;
  } catch {
    return undefined;
  }
}
