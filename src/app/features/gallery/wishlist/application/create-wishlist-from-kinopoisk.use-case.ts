import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { WISHLIST_REPOSITORY } from './wishlist.repository';
@Injectable({ providedIn: 'root' })
export class CreateWishlistFromKinopoiskUseCase {
  private readonly repository = inject(WISHLIST_REPOSITORY);
  execute(kpId: string): Observable<string> {
    return this.repository.createFromKinopoisk(kpId);
  }
}
