import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { provideAuthSessionTesting, resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { AuthSession } from './auth-session';
import { authenticatedGuard } from './authenticated-guard';

describe('authenticatedGuard', () => {
  beforeEach(() => {
    resetTestAuthStorage();
    TestBed.configureTestingModule({ providers: [provideAuthSessionTesting(), provideRouter([])] });
  });

  it('redirects a signed-out user to the movie list and preserves query parameters', () => {
    const route = { queryParams: { page: '2' }, data: { authRedirectTo: '/gallery/movies' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => authenticatedGuard(route, {} as RouterStateSnapshot));

    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/gallery/movies?page=2');
  });

  it('redirects a signed-out Series editor navigation to Series', () => {
    const route = { queryParams: { search: 'Test' }, data: { authRedirectTo: '/gallery/series' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => authenticatedGuard(route, {} as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/gallery/series?search=Test');
  });

  it('allows an authenticated user', () => {
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);

    const result = TestBed.runInInjectionContext(() =>
      authenticatedGuard({ queryParams: {} } as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });
});
