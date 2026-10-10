import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import type { Observable } from 'rxjs';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import { toCollectionQueryParams } from '../../data-access/collection-query-params';

@Injectable({ providedIn: 'root' })
export class WishlistApiClient {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  createFromKinopoisk(kpId: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.url}/from-kinopoisk`, { kpId });
  }
  refresh(id: string, kpId: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.url}/${encodeURIComponent(id)}/refresh`, { kpId });
  }
  find(params: CatalogParams): Observable<unknown> {
    return this.http.get<unknown>(this.url, { params: toCollectionQueryParams(params) });
  }
  findById(id: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.url}/${encodeURIComponent(id)}`);
  }
  delete(id: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${encodeURIComponent(id)}`);
  }
  private get url(): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/wishlist`;
  }
}
