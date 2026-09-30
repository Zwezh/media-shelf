import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { type Observable } from 'rxjs';

const POISKKINO_API_URL = 'https://api.poiskkino.dev';

@Service()
export class KinopoiskApiClient {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  getMovie(id: number): Observable<unknown> {
    return this.http.get<unknown>(`${POISKKINO_API_URL}/v1.4/movie/${id}`, {
      headers: { 'X-API-KEY': this.environment.kinopoiskToken },
    });
  }
}
