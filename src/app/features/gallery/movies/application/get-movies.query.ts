import { inject, Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { type MoviesPage } from '../../models/movies-page';
import { type MoviesParams } from '../../models/movies-params';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class GetMoviesQuery {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(query: MoviesParams): Observable<MoviesPage> {
    return this.movies.find(query);
  }
}
