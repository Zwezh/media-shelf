import { inject, Service } from '@angular/core';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class GetMovieDetailsQuery {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(id: string) {
    return this.movies.findById(id);
  }
}
