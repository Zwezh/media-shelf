import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { catchError, defer, finalize, firstValueFrom, from, map, of, shareReplay, throwError, type Observable } from 'rxjs';
import { BrowserStorage } from '@msh-core/storage/browser-storage';
import { StorageKey } from '@msh-core/storage/storage-key';
import { AuthApi } from './auth-api';

const MAX_TIMER_DELAY_MS = 2_147_483_647;

@Service()
export class AuthSession {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(AuthApi);
  private readonly document = inject(DOCUMENT);
  private readonly token = signal('');
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;
  private refreshInFlight: Observable<string> | undefined;
  private generation = 0;
  private logoutInFlight: Promise<void> | undefined;

  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== '');

  constructor() {
    // Retire the previous persistent JWT without restoring it.
    inject(BrowserStorage).remove(StorageKey.Token);
    this.destroyRef.onDestroy(() => {
      this.generation++;
      this.clearExpiryTimer();
    });
  }

  start(accessToken: string): void {
    this.applyToken(accessToken);
    this.generation++;
  }

  restore(): Observable<void> {
    return this.refresh().pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
    );
  }

  needsRefresh(): boolean {
    return !this.token() || (jwtExpiryTime(this.token()) ?? 0) <= Date.now();
  }

  refresh(): Observable<string> {
    if (this.refreshInFlight) return this.refreshInFlight;
    const generation = this.generation;
    const refresh = defer(() => {
      // Serialize cookie rotation across same-origin tabs where Web Locks is available.
      const locks = this.document.defaultView?.navigator.locks;
      return locks ? from(locks.request('media-shelf-refresh', () => firstValueFrom(this.api.refresh()))) : this.api.refresh();
    }).pipe(
      map((token) => {
        if (generation !== this.generation) throw new HttpErrorResponse({ status: 401 });
        this.applyToken(token);
        return token;
      }),
      catchError((error: unknown) => {
        if (generation === this.generation && error instanceof HttpErrorResponse && error.status === 401) this.invalidate();
        return throwError(() => error);
      }),
      finalize(() => {
        if (this.refreshInFlight === refresh) this.refreshInFlight = undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.refreshInFlight = refresh;
    return refresh;
  }

  signOut(): Promise<void> {
    if (this.logoutInFlight) return this.logoutInFlight;
    const logout = firstValueFrom(this.api.logout())
      .then(() => this.invalidate())
      .finally(() => {
        if (this.logoutInFlight === logout) this.logoutInFlight = undefined;
      });
    this.logoutInFlight = logout;
    return logout;
  }

  invalidate(): void {
    this.generation++;
    this.clearExpiryTimer();
    this.token.set('');
  }

  private applyToken(accessToken: string): void {
    const expiresAt = jwtExpiryTime(accessToken);
    if (expiresAt === undefined || expiresAt <= Date.now()) throw new TypeError('Invalid or expired access token');
    this.clearExpiryTimer();
    this.token.set(accessToken);
    this.scheduleExpiry(expiresAt);
  }

  private scheduleExpiry(expiresAt: number): void {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      this.refresh().subscribe({
        error: () => {
          /* Requests can retry temporary network failures. */
        },
      });
      return;
    }
    this.expiryTimer = setTimeout(() => this.scheduleExpiry(expiresAt), Math.min(remaining, MAX_TIMER_DELAY_MS));
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer !== undefined) clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
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
