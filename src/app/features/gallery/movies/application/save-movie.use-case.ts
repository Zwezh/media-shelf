import { inject, Service } from '@angular/core';
import { type MovieEditorMode, type MovieEditorModel } from '../../movie-editor/models/movie-editor.model';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class SaveMovieUseCase {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(mode: MovieEditorMode, draft: MovieEditorModel) {
    return mode === 'add' ? this.movies.create(draft) : this.movies.update(draft);
  }
}
