import { HttpErrorResponse } from '@angular/common/http';
import { type Provider } from '@angular/core';
import { type Observable, of, throwError } from 'rxjs';
import { AuthApi } from '@msh-core/auth/auth-api';
import { StorageKey } from '@msh-core/storage/storage-key';

export const TEST_ACCESS_TOKEN = 'e30.eyJleHAiOjQxMDI0NDQ4MDB9.signature';

export const resetTestAuthStorage = (): void => localStorage.removeItem(StorageKey.Token);

export const provideAuthSessionTesting = (): Provider => ({
  provide: AuthApi,
  useValue: {
    refresh: (): Observable<string> => throwError(() => new HttpErrorResponse({ status: 401 })),
    logout: (): Observable<void> => of(undefined),
  },
});
