import { inject, Injectable } from '@angular/core';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, type Observable, throwError } from 'rxjs';
import { parseTitleDto, parseTitlesPageDto } from '../../catalog/data-access/title-dto.parser';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { Title, TitleDraft } from '../../catalog/models/title';
import { toTitle, toTitlesPage, toTitleWriteDto } from '../../catalog/utils/title.converter';
import type { CollectionPage } from '../../models/collection-page';
import type { WishlistRepository } from '../application/wishlist.repository';
import { WishlistApiClient } from './wishlist-api.client';

@Injectable({ providedIn: 'root' })
export class HttpWishlistRepository implements WishlistRepository {
  private readonly api = inject(WishlistApiClient);

  find(query: CatalogParams): Observable<CollectionPage<Title>> {
    return this.api.find(query).pipe(
      map((value) => toTitlesPage(parseTitlesPageDto(value, parseTitleDto), (dto) => toTitle(dto))),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  findById(id: string): Observable<Title> {
    return this.read(this.api.findById(id));
  }
  create(draft: TitleDraft): Observable<Title> {
    return this.read(this.api.create(toTitleWriteDto(draft)));
  }
  update(id: string, draft: TitleDraft): Observable<Title> {
    return this.read(this.api.update(id, toTitleWriteDto(draft)));
  }
  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      map(() => undefined),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  promote(id: string, addedDate: string): Observable<Title> {
    return this.read(this.api.promote(id, addedDate));
  }
  private read(response: Observable<unknown>): Observable<Title> {
    return response.pipe(
      map(parseTitleDto),
      map((dto) => toTitle(dto)),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
}
