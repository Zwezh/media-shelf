import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import type { Observable } from 'rxjs';

@Service()
export class TitleAutofillApiClient {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  getTitle(kpId: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.environment.apiUrl.replace(/\/$/, '')}/kinopoisk/titles/${encodeURIComponent(kpId)}/autofill`);
  }
}
