import { InjectionToken } from '@angular/core';
import { type Observable } from 'rxjs';
import { type MovieAutofill } from '../../movie-editor/models/movie-autofill.model';

export interface KinopoiskRepository {
  getMovieAutofill(id: number): Observable<MovieAutofill>;
}

export const KINOPOISK_REPOSITORY = new InjectionToken<KinopoiskRepository>('KINOPOISK_REPOSITORY');
