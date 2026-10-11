import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { AuthApi } from './auth-api';

describe('AuthApi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApi,
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', production: false }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  it('preserves significant whitespace in the secret key', async () => {
    const result = firstValueFrom(TestBed.inject(AuthApi).signIn('  secret  '));
    const request = TestBed.inject(HttpTestingController).expectOne('http://localhost:4200/api/auth');

    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-MediaShelf-Request')).toBe('1');
    expect(request.request.body).toEqual({ secretKey: '  secret  ' });
    request.flush({ access_token: ' jwt ' });

    await expect(result).resolves.toBe('jwt');
  });

  it('rejects a malformed response', async () => {
    const result = firstValueFrom(TestBed.inject(AuthApi).signIn('secret'));
    TestBed.inject(HttpTestingController).expectOne('http://localhost:4200/api/auth').flush({ token: 'jwt' });

    await expect(result).rejects.toThrowError('Invalid authentication response');
  });
  it('bounds logout requests so a stalled response cannot keep the action pending forever', async () => {
    vi.useFakeTimers();
    try {
      const result = firstValueFrom(TestBed.inject(AuthApi).logout());
      const rejection = expect(result).rejects.toThrow('Timeout');
      const request = TestBed.inject(HttpTestingController).expectOne('http://localhost:4200/api/auth/logout');
      await vi.advanceTimersByTimeAsync(15_000);
      await rejection;
      expect(request.cancelled).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
