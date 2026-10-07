import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import type { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TitleAutofillApiClient {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  getTitle(kpId: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.environment.apiUrl.replace(/\/$/, '')}/kinopoisk/titles/${encodeURIComponent(kpId)}/autofill`);
  }
}
