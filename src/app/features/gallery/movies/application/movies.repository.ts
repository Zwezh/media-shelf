import { InjectionToken } from '@angular/core';
import { type Observable } from 'rxjs';
import { type Media } from '../../models/media';
import { type MovieDetails } from '../../models/movie-details';
import { type MoviesPage } from '../../models/movies-page';
import { type MoviesParams } from '../../models/movies-params';
import { type MovieEditorModel } from '../../movie-editor/models/movie-editor.model';

export interface MoviesRepository {
  find(query: MoviesParams): Observable<MoviesPage>;
  findById(id: string): Observable<MovieDetails>;
  getForEdit(id: string): Observable<MovieEditorModel>;
  create(draft: MovieEditorModel): Observable<Media>;
  update(draft: MovieEditorModel): Observable<Media>;
  delete(id: string): Observable<void>;
}

export const MOVIES_REPOSITORY = new InjectionToken<MoviesRepository>('MOVIES_REPOSITORY');
