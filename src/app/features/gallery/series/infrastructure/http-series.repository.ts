import { inject, Injectable } from '@angular/core';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, type Observable, throwError } from 'rxjs';
import { parseSeriesTitleDto, parseTitlesPageDto } from '../../catalog/data-access/title-dto.parser';
import type { CatalogParams } from '../../catalog/models/catalog-params';
import type { SeriesTitle, SeriesDraft } from '../../catalog/models/title';
import { toTitle, toTitlesPage, toTitleWriteDto } from '../../catalog/utils/title.converter';
import type { CollectionPage } from '../../models/collection-page';
import type { SeriesRepository } from '../application/series.repository';
import { SeriesApiClient } from './series-api.client';

@Injectable({ providedIn: 'root' })
export class HttpSeriesRepository implements SeriesRepository {
  private readonly api = inject(SeriesApiClient);

  find(query: CatalogParams): Observable<CollectionPage<SeriesTitle>> {
    return this.api.find(query).pipe(
      map((value) => toTitlesPage(parseTitlesPageDto(value, parseSeriesTitleDto), (dto) => toTitle(dto))),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  findById(id: string): Observable<SeriesTitle> {
    return this.read(this.api.findById(id));
  }
  create(draft: SeriesDraft, wishlistId?: string): Observable<SeriesTitle> {
    return this.read(this.api.create(toTitleWriteDto(draft), wishlistId));
  }
  update(id: string, draft: SeriesDraft): Observable<SeriesTitle> {
    return this.read(this.api.update(id, toTitleWriteDto(draft)));
  }
  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      map(() => undefined),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
  private read(response: Observable<unknown>): Observable<SeriesTitle> {
    return response.pipe(
      map(parseSeriesTitleDto),
      map((dto) => toTitle(dto)),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
}
