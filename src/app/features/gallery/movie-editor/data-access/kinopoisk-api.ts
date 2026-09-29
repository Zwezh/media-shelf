import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { map, type Observable } from 'rxjs';
import { type MovieAutofill } from '../models/movie-autofill.model';
import { toMovieAutofill } from '../utils/kinopoisk.converter';
import { parseKinopoiskFilm } from './kinopoisk.parser';

const POISKKINO_API_URL = 'https://api.poiskkino.dev';

@Service()
export class KinopoiskApi {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  getMovieAutofill(id: number): Observable<MovieAutofill> {
    return this.http
      .get<unknown>(`${POISKKINO_API_URL}/v1.4/movie/${id}`, {
        headers: { 'X-API-KEY': this.environment.kinopoiskToken },
      })
      .pipe(map(parseKinopoiskFilm), map(toMovieAutofill));
  }
}
