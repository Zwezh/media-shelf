import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, timeout, type Observable } from 'rxjs';
import { ENVIRONMENT } from '@msh-core/config/environment.token';

@Service()
export class AuthApi {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  signIn(secretKey: string): Observable<string> {
    return this.http
      .post<unknown>(this.authUrl(), { secretKey: secretKey.trim() }, this.options)
      .pipe(timeout(15_000), map(parseAccessToken));
  }

  private readonly options = { withCredentials: true, headers: { 'X-MediaShelf-Request': '1' } };

  refresh(): Observable<string> {
    return this.http.post<unknown>(`${this.authUrl()}/refresh`, {}, this.options).pipe(timeout(15_000), map(parseAccessToken));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl()}/logout`, {}, this.options);
  }

  private authUrl(): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/auth`;
  }
}

function parseAccessToken(value: unknown): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalidAuthResponse();
  const token = (value as Record<string, unknown>)['access_token'];
  if (typeof token !== 'string' || !token.trim()) throw invalidAuthResponse();
  return token.trim();
}

function invalidAuthResponse(): TypeError {
  return new TypeError('Invalid authentication response');
}
