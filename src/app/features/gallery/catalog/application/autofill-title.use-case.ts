import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { SeriesDraft, TitleDraft } from '../models/title';
import { mergeTitleAutofill } from '../utils/title-autofill';
import { TITLE_AUTOFILL_REPOSITORY } from './title-autofill.repository';

@Injectable({ providedIn: 'root' })
export class AutofillTitleUseCase {
  private readonly repository = inject(TITLE_AUTOFILL_REPOSITORY);

  execute(kpId: string, currentDraft: () => SeriesDraft): Observable<SeriesDraft>;
  execute(kpId: string, currentDraft: () => TitleDraft): Observable<TitleDraft>;
  execute(kpId: string, currentDraft: () => TitleDraft): Observable<TitleDraft> {
    return this.repository.getTitleAutofill(kpId).pipe(map((autofill) => mergeTitleAutofill(currentDraft(), autofill)));
  }
}
