import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { StatisticsSnapshot } from '../models/statistics-snapshot';
export interface StatisticsRepository {
  getSnapshot(): Observable<StatisticsSnapshot | null>;
  scan(): Observable<StatisticsSnapshot>;
}
export const STATISTICS_REPOSITORY = new InjectionToken<StatisticsRepository>('STATISTICS_REPOSITORY');
