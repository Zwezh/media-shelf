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
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', kinopoiskToken: '', production: false }),
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
    client.get('https://api.poiskkino.dev/v1.4/movie/1').subscribe();

    const apiRequest = controller.expectOne('http://localhost:4200/api/movies');
    const authRequest = controller.expectOne('http://localhost:4200/api/auth');
    const externalRequest = controller.expectOne('https://api.poiskkino.dev/v1.4/movie/1');
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

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
  });
});
