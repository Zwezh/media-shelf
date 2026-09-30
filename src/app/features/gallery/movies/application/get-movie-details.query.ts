import { inject, Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { type MovieDetails } from '../../models/movie-details';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class GetMovieDetailsQuery {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(id: string): Observable<MovieDetails> {
    return this.movies.findById(id);
  }
}
