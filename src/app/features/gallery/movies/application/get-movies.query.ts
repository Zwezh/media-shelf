import { inject, Service } from '@angular/core';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class GetMoviesQuery {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(query: Parameters<(typeof this.movies)['find']>[0]) {
    return this.movies.find(query);
  }
}
