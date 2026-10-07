import { inject, Injectable } from '@angular/core';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, type Observable, throwError } from 'rxjs';
import type { TitleAutofillRepository } from '../../application/title-autofill.repository';
import { assertAutofillId, parseTitleAutofillDto, toTitleAutofill } from '../../data-access/title-autofill.parser';
import type { TitleAutofill } from '../../models/title-autofill';
import { TitleAutofillApiClient } from './title-autofill-api.client';

@Injectable({ providedIn: 'root' })
export class HttpTitleAutofillRepository implements TitleAutofillRepository {
  private readonly api = inject(TitleAutofillApiClient);

  getTitleAutofill(kpId: string): Observable<TitleAutofill> {
    return this.api.getTitle(kpId).pipe(
      map(parseTitleAutofillDto),
      map((dto) => {
        assertAutofillId(kpId, dto.kpId);
        return toTitleAutofill(dto);
      }),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
}
