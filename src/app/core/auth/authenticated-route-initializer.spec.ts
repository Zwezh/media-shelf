import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { provideAuthSessionTesting, resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { AuthSession } from './auth-session';
import { authenticatedGuard } from './authenticated-guard';
import { authenticatedRouteInitializer } from './authenticated-route-initializer';

@Component({ changeDetection: ChangeDetectionStrategy.OnPush, template: '' })
class TestPage {}

async function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideAuthSessionTesting(),
      provideRouter([
        ...['movies', 'series'].flatMap((collection) => [
          { path: `gallery/${collection}`, component: TestPage },
          ...['new', ':id/edit'].map((path) => ({
            path: `gallery/${collection}/${path}`,
            component: TestPage,
            canActivate: [authenticatedGuard],
            data: { authRedirectTo: `/gallery/${collection}` },
          })),
        ]),
      ]),
    ],
  });
  TestBed.runInInjectionContext(authenticatedRouteInitializer);
  const session = TestBed.inject(AuthSession);
  session.start(TEST_ACCESS_TOKEN);
  const harness = await RouterTestingHarness.create();
  return { session, harness, router: TestBed.inject(Router) };
}

beforeEach(resetTestAuthStorage);
afterEach(() => {
  TestBed.resetTestingModule();
  resetTestAuthStorage();
  vi.useRealTimers();
});

describe('authenticated route session loss', () => {
  it.each(['movies/new', 'movies/123/edit', 'series/new', 'series/123/edit'])(
    'leaves %s for its collection and preserves query parameters',
    async (path) => {
      const { session, harness, router } = await setup();
      await harness.navigateByUrl(`/gallery/${path}?search=Test`);
      const navigation = firstValueFrom(router.events.pipe(filter((event) => event instanceof NavigationEnd)));
      await session.signOut();
      TestBed.tick();
      await navigation;
      expect(router.url).toBe(`/gallery/${path.split('/')[0]}?search=Test`);
    },
  );

  it.each(['movies/new', 'movies/123/edit', 'series/new', 'series/123/edit'])(
    'redirects %s at the JWT expiry boundary without another request or navigation',
    async (path) => {
      const { session, harness, router } = await setup();
      await harness.navigateByUrl(`/gallery/${path}?search=Test`);
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
      const payload = globalThis.btoa(JSON.stringify({ exp: Date.now() / 1000 + 1 }));
      session.start(`e30.${payload}.signature`);
      const navigate = vi.spyOn(router, 'navigate');
      vi.advanceTimersByTime(999);
      TestBed.tick();
      expect(session.isAuthenticated()).toBe(true);
      expect(navigate).not.toHaveBeenCalled();
      expect(router.url).toBe(`/gallery/${path}?search=Test`);
      const navigation = firstValueFrom(router.events.pipe(filter((event) => event instanceof NavigationEnd)));
      vi.advanceTimersByTime(1);
      TestBed.tick();
      expect(session.isAuthenticated()).toBe(false);
      expect(navigate).toHaveBeenCalledWith([`/gallery/${path.split('/')[0]}`], {
        queryParams: { search: 'Test' },
        replaceUrl: true,
      });
      await navigation;
      expect(router.url).toBe(`/gallery/${path.split('/')[0]}?search=Test`);
    },
  );

  it('keeps an unprotected collection page open on sign out', async () => {
    const { session, harness, router } = await setup();
    await harness.navigateByUrl('/gallery/series?search=Test');
    const navigate = vi.spyOn(router, 'navigate');
    await session.signOut();
    TestBed.tick();
    expect(navigate).not.toHaveBeenCalled();
    expect(router.url).toBe('/gallery/series?search=Test');
  });
});
