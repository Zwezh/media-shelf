import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import type { Observable } from 'rxjs';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { SeriesTitleWriteDto } from '../../catalog/models/title.dto';
import { toCollectionQueryParams } from '../../data-access/collection-query-params';

@Injectable({ providedIn: 'root' })
export class SeriesApiClient {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  find(params: CatalogParams): Observable<unknown> {
    return this.http.get<unknown>(this.url, { params: toCollectionQueryParams(params) });
  }
  findById(id: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.url}/${encodeURIComponent(id)}`);
  }
  create(draft: SeriesTitleWriteDto): Observable<unknown> {
    return this.http.post<unknown>(this.url, draft);
  }
  update(id: string, draft: SeriesTitleWriteDto): Observable<unknown> {
    return this.http.put<unknown>(`${this.url}/${encodeURIComponent(id)}`, draft);
  }
  delete(id: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${encodeURIComponent(id)}`);
  }
  private get url(): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/series`;
  }
}
