import type { Observable } from 'rxjs';
import type { CollectionPage } from '../../models/collection-page';
import type { GalleryItem } from '../models/gallery-item';
import { inject, Injectable } from '@angular/core';
import { GALLERY_REPOSITORY } from './gallery.repository';
import type { GalleryParams } from '../models/gallery-item';
@Injectable({ providedIn: 'root' })
export class GetGalleryQuery {
  private readonly repository = inject(GALLERY_REPOSITORY);
  execute(params: GalleryParams): Observable<CollectionPage<GalleryItem>> {
    return this.repository.find(params);
  }
}
