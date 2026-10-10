import { inject, Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { type Media } from '../../models/media';
import { type MovieEditorMode, type MovieEditorModel } from '../../movie-editor/models/movie-editor.model';
import { MOVIES_REPOSITORY } from './movies.repository';

@Service()
export class SaveMovieUseCase {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(mode: MovieEditorMode, draft: MovieEditorModel, wishlistId?: string): Observable<Media> {
    return mode === 'add' ? (wishlistId ? this.movies.create(draft, wishlistId) : this.movies.create(draft)) : this.movies.update(draft);
  }
}
