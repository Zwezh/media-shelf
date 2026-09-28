import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { AuthSession } from './auth-session';

export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const environment = inject(ENVIRONMENT);
  const session = inject(AuthSession);
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  const authUrl = `${apiUrl}/auth`;
  const token = session.accessToken();

  if (!token || request.url === authUrl || !isApiRequest(request.url, apiUrl)) return next(request);

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) session.signOut();
      return throwError(() => error);
    }),
  );
};

function isApiRequest(requestUrl: string, apiUrl: string): boolean {
  return requestUrl === apiUrl || requestUrl.startsWith(`${apiUrl}/`);
}
