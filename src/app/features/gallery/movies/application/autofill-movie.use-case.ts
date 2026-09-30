import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { type MovieEditorModel } from '../../movie-editor/models/movie-editor.model';
import { mergeMovieAutofill } from '../../movie-editor/utils/movie-editor.converter';
import { KINOPOISK_REPOSITORY } from './kinopoisk.repository';

@Service()
export class AutofillMovieUseCase {
  private readonly kinopoisk = inject(KINOPOISK_REPOSITORY);

  execute(id: number, currentDraft: () => MovieEditorModel): Observable<MovieEditorModel> {
    return this.kinopoisk.getMovieAutofill(id).pipe(map((autofill) => mergeMovieAutofill(currentDraft(), autofill)));
  }
}
