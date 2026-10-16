import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { provideAuthSessionTesting, resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { Subject } from 'rxjs';
import { AuthApi } from './auth-api';
import { AuthSession } from './auth-session';
import { authenticatedGuard } from './authenticated-guard';

describe('authenticatedGuard', () => {
  beforeEach(() => {
    resetTestAuthStorage();
    TestBed.configureTestingModule({ providers: [provideAuthSessionTesting(), provideRouter([])] });
  });

  it('redirects a signed-out user to the movie list and preserves query parameters', async () => {
    const route = { queryParams: { page: '2' }, data: { authRedirectTo: '/gallery/movies' } } as unknown as ActivatedRouteSnapshot;
    const result = await TestBed.runInInjectionContext(() => authenticatedGuard(route, {} as RouterStateSnapshot));

    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/gallery/movies?page=2');
  });

  it('redirects a signed-out Series editor navigation to Series', async () => {
    const route = { queryParams: { search: 'Test' }, data: { authRedirectTo: '/gallery/series' } } as unknown as ActivatedRouteSnapshot;
    const result = await TestBed.runInInjectionContext(() => authenticatedGuard(route, {} as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/gallery/series?search=Test');
  });

  it('allows an authenticated user', async () => {
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);

    const result = await TestBed.runInInjectionContext(() =>
      authenticatedGuard({ queryParams: {} } as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it.each([true, false])('waits for startup restoration before deciding access (success: %s)', async (success) => {
    const response = new Subject<string>();
    const refresh = vi.fn(() => response);
    TestBed.overrideProvider(AuthApi, { useValue: { refresh } });
    const session = TestBed.inject(AuthSession);
    session.restore().subscribe();
    const route = { queryParams: { page: '2' }, data: { authRedirectTo: '/gallery/movies' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => authenticatedGuard(route, {} as RouterStateSnapshot));
    const settled = vi.fn();
    void Promise.resolve(result).then(settled);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledOnce();

    if (success) response.next(TEST_ACCESS_TOKEN);
    else response.error(new Error('refresh failed'));

    const decision = await result;
    if (success) expect(decision).toBe(true);
    else expect(TestBed.inject(Router).serializeUrl(decision as ReturnType<Router['createUrlTree']>)).toBe('/gallery/movies?page=2');
    expect(refresh).toHaveBeenCalledOnce();
  });
});
