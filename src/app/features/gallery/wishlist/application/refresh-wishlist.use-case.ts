import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Title } from '../../catalog/models/title';
import { WISHLIST_REPOSITORY } from './wishlist.repository';
@Injectable({ providedIn: 'root' })
export class RefreshWishlistUseCase {
  private readonly repository = inject(WISHLIST_REPOSITORY);
  execute(id: string, kpId: string): Observable<Title> {
    return this.repository.refresh(id, kpId);
  }
}
