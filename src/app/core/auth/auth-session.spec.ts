import { TestBed } from '@angular/core/testing';
import { StorageKey } from '@msh-core/storage/storage-key';
import { TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { AuthSession } from './auth-session';

describe('AuthSession', () => {
  beforeEach(() => localStorage.removeItem(StorageKey.Token));
  afterEach(() => localStorage.removeItem(StorageKey.Token));

  it('persists a valid token until sign out', () => {
    const session = TestBed.inject(AuthSession);

    session.start(TEST_ACCESS_TOKEN);

    expect(session.accessToken()).toBe(TEST_ACCESS_TOKEN);
    expect(session.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(StorageKey.Token)).toBe(TEST_ACCESS_TOKEN);

    session.signOut();

    expect(session.accessToken()).toBe('');
    expect(session.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(StorageKey.Token)).toBeNull();
  });

  it('restores a valid persisted token after application reload', () => {
    localStorage.setItem(StorageKey.Token, TEST_ACCESS_TOKEN);

    const session = TestBed.inject(AuthSession);

    expect(session.accessToken()).toBe(TEST_ACCESS_TOKEN);
    expect(session.isAuthenticated()).toBe(true);
  });

  it('removes an invalid persisted token instead of restoring it', () => {
    localStorage.setItem(StorageKey.Token, 'invalid');

    const session = TestBed.inject(AuthSession);

    expect(session.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(StorageKey.Token)).toBeNull();
  });

  it.each(['invalid', 'e30.eyJleHAiOjF9.signature'])('rejects malformed or expired token %s', (token) => {
    const session = TestBed.inject(AuthSession);

    expect(() => session.start(token)).toThrowError('Invalid or expired access token');
    expect(session.isAuthenticated()).toBe(false);
  });

  it('clears the session when the JWT expiry time is reached', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
      const payload = globalThis.btoa(JSON.stringify({ exp: Date.now() / 1_000 + 1 }));
      const session = TestBed.inject(AuthSession);

      session.start(`e30.${payload}.signature`);
      vi.advanceTimersByTime(1_000);

      expect(session.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(StorageKey.Token)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
