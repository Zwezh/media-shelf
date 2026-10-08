import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { AuthApi } from './auth-api';
import { AuthSession } from './auth-session';

describe('AuthSession', () => {
  const refresh = vi.fn();
  const logout = vi.fn();
  beforeEach(() => {
    localStorage.removeItem('token');
    refresh.mockReset().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    logout.mockReset().mockReturnValue(of(undefined));
    TestBed.configureTestingModule({ providers: [{ provide: AuthApi, useValue: { refresh, logout } }] });
  });
  afterEach(() => {
    localStorage.removeItem('token');
    vi.useRealTimers();
  });
  it('keeps JWTs only in memory and retires the old persistent token', async () => {
    localStorage.setItem('token', TEST_ACCESS_TOKEN);
    const session = TestBed.inject(AuthSession);
    expect(session.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    session.start(TEST_ACCESS_TOKEN);
    expect(session.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('token')).toBeNull();
    await session.signOut();
    expect(logout).toHaveBeenCalledOnce();
    expect(session.isAuthenticated()).toBe(false);
  });
  it('restores the session through the refresh cookie on startup', async () => {
    refresh.mockReturnValue(of(TEST_ACCESS_TOKEN));
    const session = TestBed.inject(AuthSession);
    await firstValueFrom(session.restore());
    expect(session.accessToken()).toBe(TEST_ACCESS_TOKEN);
  });
  it('allows public browsing when startup refresh fails', async () => {
    const session = TestBed.inject(AuthSession);
    await firstValueFrom(session.restore());
    expect(session.isAuthenticated()).toBe(false);
  });
  it('shares concurrent refreshes and rejects delayed responses after session replacement', () => {
    const response = new Subject<string>();
    refresh.mockReturnValue(response);
    const session = TestBed.inject(AuthSession);
    const error = vi.fn();
    session.refresh().subscribe({ error });
    session.refresh().subscribe({ error });
    expect(refresh).toHaveBeenCalledOnce();
    session.invalidate();
    response.next(TEST_ACCESS_TOKEN);
    expect(error).toHaveBeenCalledTimes(2);
    expect(session.isAuthenticated()).toBe(false);
  });
  it('retains the session if server logout fails', async () => {
    logout.mockReturnValue(throwError(() => new Error('offline')));
    const session = TestBed.inject(AuthSession);
    session.start(TEST_ACCESS_TOKEN);
    await expect(session.signOut()).rejects.toThrow('offline');
    expect(session.isAuthenticated()).toBe(true);
  });
  it.each(['invalid', 'e30.eyJleHAiOjF9.signature'])('rejects invalid or expired JWTs', (token) => {
    expect(() => TestBed.inject(AuthSession).start(token)).toThrow('Invalid or expired access token');
  });
  it('refreshes at expiry and clears a rejected session', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    const payload = btoa(JSON.stringify({ exp: Date.now() / 1000 + 1 }));
    const session = TestBed.inject(AuthSession);
    session.start(`e30.${payload}.signature`);
    vi.advanceTimersByTime(1000);
    expect(refresh).toHaveBeenCalledOnce();
    expect(session.isAuthenticated()).toBe(false);
  });
});
