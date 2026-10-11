import type { Observable } from 'rxjs';
import type { StatisticsSnapshot } from '../models/statistics-snapshot';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { toAppError } from '@msh-core/http/app-error';
import type { StatisticsRepository } from '../application/statistics.repository';
import { parseStatisticsResponse, parseStatisticsScanResponse } from './statistics-parser';
@Service()
export class HttpStatisticsRepository implements StatisticsRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(ENVIRONMENT).apiUrl.replace(/\/$/, '')}/statistics`;
  getSnapshot(): Observable<StatisticsSnapshot | null> {
    return this.http.get<unknown>(this.url).pipe(
      map(parseStatisticsResponse),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  scan(): Observable<StatisticsSnapshot> {
    return this.http.post<unknown>(`${this.url}/scan`, {}).pipe(
      map(parseStatisticsScanResponse),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
}
