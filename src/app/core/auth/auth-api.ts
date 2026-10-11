import { isRecord } from '@msh-shared/utils/record';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, timeout, type Observable } from 'rxjs';
import { ENVIRONMENT } from '@msh-core/config/environment.token';

const AUTH_REQUEST_TIMEOUT_MS = 15_000;

@Service()
export class AuthApi {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  signIn(secretKey: string): Observable<string> {
    return this.http
      .post<unknown>(this.authUrl(), { secretKey }, this.options)
      .pipe(timeout(AUTH_REQUEST_TIMEOUT_MS), map(parseAccessToken));
  }

  private readonly options = { withCredentials: true, headers: { 'X-MediaShelf-Request': '1' } };

  refresh(): Observable<string> {
    return this.http
      .post<unknown>(`${this.authUrl()}/refresh`, {}, this.options)
      .pipe(timeout(AUTH_REQUEST_TIMEOUT_MS), map(parseAccessToken));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl()}/logout`, {}, this.options).pipe(timeout(AUTH_REQUEST_TIMEOUT_MS));
  }

  private authUrl(): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/auth`;
  }
}

function parseAccessToken(value: unknown): string {
  if (!isRecord(value)) throw invalidAuthResponse();
  const token = value['access_token'];
  if (typeof token !== 'string' || !token.trim()) throw invalidAuthResponse();
  return token.trim();
}

function invalidAuthResponse(): TypeError {
  return new TypeError('Invalid authentication response');
}
