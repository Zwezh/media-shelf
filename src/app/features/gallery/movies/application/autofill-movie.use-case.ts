import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { type MovieEditorModel } from '../../movie-editor/models/movie-editor.model';
import { mergeMovieAutofill } from '../../movie-editor/utils/movie-editor.converter';
import { TITLE_AUTOFILL_REPOSITORY } from '../../catalog/application/title-autofill.repository';

@Service()
export class AutofillMovieUseCase {
  private readonly kinopoisk = inject(TITLE_AUTOFILL_REPOSITORY);

  execute(id: number, currentDraft: () => MovieEditorModel): Observable<MovieEditorModel> {
    return this.kinopoisk.getTitleAutofill(String(id)).pipe(map((autofill) => mergeMovieAutofill(currentDraft(), autofill)));
  }
}
