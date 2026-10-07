import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TitleAutofill } from '../models/title-autofill';

export interface TitleAutofillRepository {
  getTitleAutofill(kpId: string): Observable<TitleAutofill>;
}
export const TITLE_AUTOFILL_REPOSITORY = new InjectionToken<TitleAutofillRepository>('TITLE_AUTOFILL_REPOSITORY');
