import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { WISHLIST_REPOSITORY } from './wishlist.repository';

@Injectable({ providedIn: 'root' })
export class DeleteWishlistUseCase {
  private readonly repository = inject(WISHLIST_REPOSITORY);

  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
