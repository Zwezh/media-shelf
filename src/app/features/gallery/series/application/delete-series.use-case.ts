import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';
import { SERIES_REPOSITORY } from './series.repository';

@Service()
export class DeleteSeriesUseCase {
  private readonly repository = inject(SERIES_REPOSITORY);

  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
