import { inject, Injectable } from '@angular/core';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, type Observable, throwError } from 'rxjs';
import { parseTitleDto, parseTitlesPageDto } from '../../catalog/data-access/title-dto.parser';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { Title } from '../../catalog/models/title';
import { toTitle, toTitlesPage } from '../../catalog/utils/title.converter';
import type { CollectionPage } from '../../models/collection-page';
import type { WishlistRepository } from '../application/wishlist.repository';
import { WishlistApiClient } from './wishlist-api.client';

@Injectable({ providedIn: 'root' })
export class HttpWishlistRepository implements WishlistRepository {
  private readonly api = inject(WishlistApiClient);

  createFromKinopoisk(kpId: string): Observable<string> {
    return this.api.createFromKinopoisk(kpId).pipe(
      map((value) => {
        if (typeof value !== 'object' || value === null || !('id' in value) || typeof value.id !== 'string' || !value.id.trim())
          throw new TypeError('Invalid created wishlist response');
        return value.id;
      }),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  refresh(id: string, kpId: string): Observable<Title> {
    return this.read(this.api.refresh(id, kpId));
  }
  find(query: CatalogParams): Observable<CollectionPage<Title>> {
    return this.api.find(query).pipe(
      map((value) => toTitlesPage(parseTitlesPageDto(value, parseTitleDto), (dto) => toTitle(dto))),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  findById(id: string): Observable<Title> {
    return this.read(this.api.findById(id));
  }
  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      map(() => undefined),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  private read(response: Observable<unknown>): Observable<Title> {
    return response.pipe(
      map(parseTitleDto),
      map((dto) => toTitle(dto)),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
}
