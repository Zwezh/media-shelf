import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { type Observable } from 'rxjs';

@Service()
export class KinopoiskApiClient {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  getMovie(id: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.environment.apiUrl.replace(/\/$/, '')}/kinopoisk/movies/${id}/autofill`);
  }
}
