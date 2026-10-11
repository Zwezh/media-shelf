import type { Observable } from 'rxjs';
import type { StatisticsSnapshot } from '../models/statistics-snapshot';
import { inject, Service } from '@angular/core';
import { STATISTICS_REPOSITORY } from './statistics.repository';
@Service()
export class GetStatisticsQuery {
  private readonly repository = inject(STATISTICS_REPOSITORY);
  execute(): Observable<StatisticsSnapshot | null> {
    return this.repository.getSnapshot();
  }
}
