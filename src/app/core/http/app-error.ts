import { HttpErrorResponse } from '@angular/common/http';

export type AppErrorKind = 'conflict' | 'forbidden' | 'network' | 'not-found' | 'unauthorized' | 'unexpected' | 'validation';

export class AppError extends Error {
  constructor(
    readonly kind: AppErrorKind,
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (!(error instanceof HttpErrorResponse)) return new AppError('unexpected', 'An unexpected error occurred.', error);

  if (error.status === 0) return new AppError('network', 'The server could not be reached.', error);
  if (error.status === 400 || error.status === 422) return new AppError('validation', 'The request was invalid.', error);
  if (error.status === 401) return new AppError('unauthorized', 'Authentication is required.', error);
  if (error.status === 403) return new AppError('forbidden', 'The operation is not permitted.', error);
  if (error.status === 404) return new AppError('not-found', 'The requested resource was not found.', error);
  if (error.status === 409) return new AppError('conflict', readErrorMessage(error) ?? 'The request conflicts with existing data.', error);
  return new AppError('unexpected', 'An unexpected error occurred.', error);
}

function readErrorMessage(error: HttpErrorResponse): string | undefined {
  if (typeof error.error !== 'object' || error.error === null || Array.isArray(error.error)) return undefined;
  const message = (error.error as Record<string, unknown>)['message'];
  return typeof message === 'string' ? message : undefined;
}
