import { inject, Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class DeleteMovieUseCase {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(id: string): Observable<void> {
    return this.movies.delete(id);
  }
}
