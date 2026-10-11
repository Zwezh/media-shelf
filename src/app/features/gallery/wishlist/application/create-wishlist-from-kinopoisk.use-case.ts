import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';

import { WISHLIST_REPOSITORY } from './wishlist.repository';
@Service()
export class CreateWishlistFromKinopoiskUseCase {
  private readonly repository = inject(WISHLIST_REPOSITORY);
  execute(kpId: string): Observable<string> {
    return this.repository.createFromKinopoisk(kpId);
  }
}
