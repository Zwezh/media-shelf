import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Title } from '../../catalog/models/title';
import { WISHLIST_REPOSITORY } from './wishlist.repository';

@Service()
export class GetWishlistTitleQuery {
  private readonly repository = inject(WISHLIST_REPOSITORY);

  execute(id: string): Observable<Title> {
    return this.repository.findById(id);
  }
}
