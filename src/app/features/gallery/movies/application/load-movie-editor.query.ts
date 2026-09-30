import { inject, Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { type MovieEditorModel } from '../../movie-editor/models/movie-editor.model';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class LoadMovieEditorQuery {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(id: string): Observable<MovieEditorModel> {
    return this.movies.getForEdit(id);
  }
}
