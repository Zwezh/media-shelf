import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CollectionPage } from '../../models/collection-page';
import type { GalleryItem, GalleryParams } from '../models/gallery-item';
export interface GalleryRepository {
  find(params: GalleryParams): Observable<CollectionPage<GalleryItem>>;
}
export const GALLERY_REPOSITORY = new InjectionToken<GalleryRepository>('GALLERY_REPOSITORY');
