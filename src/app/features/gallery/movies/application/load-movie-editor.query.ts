import { inject, Service } from '@angular/core';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class LoadMovieEditorQuery {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(id: string) {
    return this.movies.getForEdit(id);
  }
}
