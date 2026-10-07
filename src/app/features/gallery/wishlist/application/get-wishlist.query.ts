import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { CollectionPage } from '../../models/collection-page';
import type { Title } from '../../catalog/models/title';
import { WISHLIST_REPOSITORY } from './wishlist.repository';

@Injectable({ providedIn: 'root' })
export class GetWishlistQuery {
  private readonly repository = inject(WISHLIST_REPOSITORY);

  execute(params: CatalogParams): Observable<CollectionPage<Title>> {
    return this.repository.find(params);
  }
}
