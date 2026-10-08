import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { AuthSession } from './auth-session';

export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = inject(ENVIRONMENT).apiUrl.replace(/\/$/, '');
  if (
    !(request.url === apiUrl || request.url.startsWith(`${apiUrl}/`)) ||
    request.url === `${apiUrl}/auth` ||
    request.url.startsWith(`${apiUrl}/auth/`)
  )
    return next(request);
  const session = inject(AuthSession);
  if (!session.accessToken()) return next(request);
  const token = session.needsRefresh() ? session.refresh() : of(session.accessToken());
  return token.pipe(
    switchMap((accessToken) => {
      const authorized = request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
      return next(authorized).pipe(
        catchError((error: unknown) => {
          if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
          // A different request may already have refreshed this token.
          const replacement =
            session.accessToken() && session.accessToken() !== accessToken ? of(session.accessToken()) : session.refresh();
          return replacement.pipe(
            switchMap((newToken) =>
              next(request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })).pipe(
                catchError((retryError: unknown) => {
                  if (retryError instanceof HttpErrorResponse && retryError.status === 401) session.invalidate();
                  return throwError(() => retryError);
                }),
              ),
            ),
          );
        }),
      );
    }),
  );
};
