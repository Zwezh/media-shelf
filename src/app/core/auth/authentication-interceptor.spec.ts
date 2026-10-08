import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { AuthSession } from './auth-session';
import { authenticationInterceptor } from './authentication-interceptor';

describe('authenticationInterceptor', () => {
  beforeEach(() => {
    resetTestAuthStorage();
    TestBed.configureTestingModule({
      providers: [
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', production: false }),
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
  });

  it('adds the bearer token only to MediaShelf API requests', () => {
    const client = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    client.get('http://localhost:4200/api/movies').subscribe();
    client.post('http://localhost:4200/api/auth', {}).subscribe();
    client.get('https://external.example/resource').subscribe();

    const apiRequest = controller.expectOne('http://localhost:4200/api/movies');
    const authRequest = controller.expectOne('http://localhost:4200/api/auth');
    const externalRequest = controller.expectOne('https://external.example/resource');
    expect(apiRequest.request.headers.get('Authorization')).toBe(`Bearer ${TEST_ACCESS_TOKEN}`);
    expect(authRequest.request.headers.has('Authorization')).toBe(false);
    expect(externalRequest.request.headers.has('Authorization')).toBe(false);

    apiRequest.flush({});
    authRequest.flush({});
    externalRequest.flush({});
    controller.verify();
  });

  it('clears the session after an authenticated 401 response', async () => {
    const result = firstValueFrom(TestBed.inject(HttpClient).get('http://localhost:4200/api/movies'));
    TestBed.inject(HttpTestingController).expectOne('http://localhost:4200/api/movies').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    const refresh = TestBed.inject(HttpTestingController).expectOne('http://localhost:4200/api/auth/refresh');
    expect(refresh.request.withCredentials).toBe(true);
    refresh.flush({}, { status: 401, statusText: 'Unauthorized' });
    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
  });
  it('shares one refresh for concurrent 401s and retries each request with the replacement token', () => {
    const client = TestBed.inject(HttpClient);
    const http = TestBed.inject(HttpTestingController);
    const next = vi.fn();
    client.get('http://localhost:4200/api/movies').subscribe(next);
    client.get('http://localhost:4200/api/settings').subscribe(next);
    http.expectOne('http://localhost:4200/api/movies').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('http://localhost:4200/api/settings').flush({}, { status: 401, statusText: 'Unauthorized' });
    const refresh = http.expectOne('http://localhost:4200/api/auth/refresh');
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    expect(refresh.request.headers.get('X-MediaShelf-Request')).toBe('1');
    const replacement = TEST_ACCESS_TOKEN.replace('signature', 'replacement');
    refresh.flush({ access_token: replacement });
    for (const path of ['movies', 'settings']) {
      const retry = http.expectOne(`http://localhost:4200/api/${path}`);
      expect(retry.request.headers.get('Authorization')).toBe(`Bearer ${replacement}`);
      retry.flush({});
    }
    expect(next).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(true);
    http.verify();
  });
  it('does not loop when the retried request is still unauthorized', () => {
    const http = TestBed.inject(HttpTestingController);
    const error = vi.fn();
    TestBed.inject(HttpClient).get('http://localhost:4200/api/movies').subscribe({ error });
    http.expectOne('http://localhost:4200/api/movies').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('http://localhost:4200/api/auth/refresh').flush({ access_token: TEST_ACCESS_TOKEN });
    http.expectOne('http://localhost:4200/api/movies').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(error).toHaveBeenCalledOnce();
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
    http.expectNone('http://localhost:4200/api/auth/refresh');
    http.verify();
  });
});
