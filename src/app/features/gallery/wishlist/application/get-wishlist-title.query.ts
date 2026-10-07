import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Title } from '../../catalog/models/title';
import { WISHLIST_REPOSITORY } from './wishlist.repository';

@Injectable({ providedIn: 'root' })
export class GetWishlistTitleQuery {
  private readonly repository = inject(WISHLIST_REPOSITORY);

  execute(id: string): Observable<Title> {
    return this.repository.findById(id);
  }
}
