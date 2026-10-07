import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { CollectionPage } from '../../models/collection-page';
import type { SeriesTitle } from '../../catalog/models/title';
import { SERIES_REPOSITORY } from './series.repository';

@Injectable({ providedIn: 'root' })
export class GetSeriesQuery {
  private readonly repository = inject(SERIES_REPOSITORY);

  execute(params: CatalogParams): Observable<CollectionPage<SeriesTitle>> {
    return this.repository.find(params);
  }
}
