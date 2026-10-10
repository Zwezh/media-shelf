import type { Observable } from 'rxjs';
import type { CollectionPage } from '../../models/collection-page';
import type { GalleryItem } from '../models/gallery-item';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, throwError } from 'rxjs';
import { toCollectionQueryParams } from '../../data-access/collection-query-params';
import type { GalleryRepository } from '../application/gallery.repository';
import type { GalleryParams } from '../models/gallery-item';
import { parseGalleryPage } from '../data-access/gallery-parser';
@Injectable({ providedIn: 'root' })
export class HttpGalleryRepository implements GalleryRepository {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(ENVIRONMENT);
  find(params: GalleryParams): Observable<CollectionPage<GalleryItem>> {
    return this.http
      .get<unknown>(`${this.environment.apiUrl.replace(/\/$/, '')}/gallery`, { params: toCollectionQueryParams(params) })
      .pipe(
        map(parseGalleryPage),
        catchError((error: unknown) => throwError(() => toAppError(error))),
      );
  }
}
