import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { Title, TitleDraft } from '../../catalog/models/title';
import type { CollectionPage } from '../../models/collection-page';

export interface WishlistRepository {
  find(query: CatalogParams): Observable<CollectionPage<Title>>;
  findById(id: string): Observable<Title>;
  create(draft: TitleDraft): Observable<Title>;
  update(id: string, draft: TitleDraft): Observable<Title>;
  delete(id: string): Observable<void>;
  promote(id: string, addedDate: string): Observable<Title>;
}
export const WISHLIST_REPOSITORY = new InjectionToken<WishlistRepository>('WISHLIST_REPOSITORY');
