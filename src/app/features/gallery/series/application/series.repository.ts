import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { SeriesTitle, SeriesDraft } from '../../catalog/models/title';
import type { CollectionPage } from '../../models/collection-page';

export interface SeriesRepository {
  find(query: CatalogParams): Observable<CollectionPage<SeriesTitle>>;
  findById(id: string): Observable<SeriesTitle>;
  create(draft: SeriesDraft): Observable<SeriesTitle>;
  update(id: string, draft: SeriesDraft): Observable<SeriesTitle>;
  delete(id: string): Observable<void>;
}
export const SERIES_REPOSITORY = new InjectionToken<SeriesRepository>('SERIES_REPOSITORY');
