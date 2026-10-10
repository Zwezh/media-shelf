import { inject, Service } from '@angular/core';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, type Observable, throwError } from 'rxjs';
import { type Media } from '../../models/media';
import { parseMediaDto, parseMoviesPageDto } from '../../data-access/media-dto.parser';
import { type MediaDto } from '../../models/media.dto';
import { type MovieDetails } from '../../models/movie-details';
import { type MoviesPage } from '../../models/movies-page';
import { type MoviesPageDto } from '../../models/movies-page.dto';
import { type MoviesParams } from '../../models/movies-params';
import { toMedia } from '../../utils/media.converter';
import { toMovieDetails } from '../../utils/movie-details.converter';
import { toMediaDto, toMovieEditorModel } from '../../movie-editor/utils/movie-editor.converter';
import { type MovieEditorModel } from '../../movie-editor/models/movie-editor.model';
import { type MoviesRepository } from '../application/movies.repository';
import { MoviesApiClient } from './movies-api.client';

@Service()
export class HttpMoviesRepository implements MoviesRepository {
  private readonly api = inject(MoviesApiClient);

  find(query: MoviesParams): Observable<MoviesPage> {
    return this.api.getMovies(query).pipe(
      map(parseMoviesPageDto),
      map((response) => toMoviesPage(response, query.currentPage)),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }

  findById(id: string): Observable<MovieDetails> {
    return this.api.getMovie(id).pipe(
      map(parseMediaDto),
      map(toMovieDetails),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }

  getForEdit(id: string): Observable<MovieEditorModel> {
    return this.api.getMovie(id).pipe(
      map(parseMediaDto),
      map(toMovieEditorModel),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }

  create(draft: MovieEditorModel, wishlistId?: string): Observable<Media> {
    return this.api.addMovie(toMediaDto(draft), wishlistId).pipe(
      map(parseMediaDto),
      map(toMedia),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }

  update(draft: MovieEditorModel): Observable<Media> {
    return this.api.updateMovie(toMediaDto(draft)).pipe(
      map(parseMediaDto),
      map(toMedia),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.deleteMovie(id).pipe(catchError((error: unknown) => throwError(() => toAppError(error))));
  }
}

function toMoviesPage(response: MoviesPageDto, requestedPage: number): MoviesPage {
  const currentPage = Number(response.currentPage);
  return {
    currentPage: Number.isInteger(currentPage) && currentPage >= 0 ? currentPage : requestedPage,
    media: response.list.map((item: MediaDto) => toMedia(item)),
    totalCount: response.totalCount,
  };
}
