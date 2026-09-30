import { inject, Service } from '@angular/core';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, throwError } from 'rxjs';
import { parseKinopoiskFilm } from '../../../movie-editor/data-access/kinopoisk.parser';
import { toMovieAutofill } from '../../../movie-editor/utils/kinopoisk.converter';
import { type KinopoiskRepository } from '../../application/kinopoisk.repository';
import { KinopoiskApiClient } from './kinopoisk-api.client';

@Service()
export class HttpKinopoiskRepository implements KinopoiskRepository {
  private readonly api = inject(KinopoiskApiClient);

  getMovieAutofill(id: number) {
    return this.api.getMovie(id).pipe(
      map(parseKinopoiskFilm),
      map(toMovieAutofill),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }
}
