import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';
import { WISHLIST_REPOSITORY } from './wishlist.repository';

@Service()
export class DeleteWishlistUseCase {
  private readonly repository = inject(WISHLIST_REPOSITORY);

  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
