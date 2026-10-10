import type { Provider } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import { GalleryFeedback } from '../features/gallery/catalog/ui/gallery-feedback';
import { DeleteWishlistUseCase } from '../features/gallery/wishlist/application/delete-wishlist.use-case';
import { RefreshWishlistUseCase } from '../features/gallery/wishlist/application/refresh-wishlist.use-case';
export const WISHLIST_MUTATION_TEST_PROVIDERS: Provider[] = [
  {
    provide: RefreshWishlistUseCase,
    useValue: { execute: (): Observable<never> => throwError((): Error => new Error('Unconfigured test refresh')) },
  },
  {
    provide: DeleteWishlistUseCase,
    useValue: { execute: (): Observable<never> => throwError((): Error => new Error('Unconfigured test delete')) },
  },
  { provide: GalleryFeedback, useValue: { success: (): undefined => undefined, error: (): undefined => undefined } },
];
