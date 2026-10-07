import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { SeriesTitle } from '../../catalog/models/title';
import { SERIES_REPOSITORY } from './series.repository';

@Injectable({ providedIn: 'root' })
export class GetSeriesTitleQuery {
  private readonly repository = inject(SERIES_REPOSITORY);

  execute(id: string): Observable<SeriesTitle> {
    return this.repository.findById(id);
  }
}
