import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { Title } from '../../catalog/models/title';
import type { CollectionPage } from '../../models/collection-page';

export interface WishlistRepository {
  createFromKinopoisk(kpId: string): Observable<string>;
  refresh(id: string, kpId: string): Observable<Title>;
  find(query: CatalogParams): Observable<CollectionPage<Title>>;
  findById(id: string): Observable<Title>;
  delete(id: string): Observable<void>;
}
export const WISHLIST_REPOSITORY = new InjectionToken<WishlistRepository>('WISHLIST_REPOSITORY');
