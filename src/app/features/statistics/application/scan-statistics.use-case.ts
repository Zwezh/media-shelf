import type { Observable } from 'rxjs';
import type { StatisticsSnapshot } from '../models/statistics-snapshot';
import { inject, Injectable } from '@angular/core';
import { STATISTICS_REPOSITORY } from './statistics.repository';
@Injectable({ providedIn: 'root' })
export class ScanStatisticsUseCase {
  private readonly repository = inject(STATISTICS_REPOSITORY);
  execute(): Observable<StatisticsSnapshot> {
    return this.repository.scan();
  }
}
