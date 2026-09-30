import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { type Observable } from 'rxjs';
import { type MediaDto } from '../../models/media.dto';
import { type MoviesParams } from '../../models/movies-params';
import { toMoviesQueryParams } from '../../utils/movies-params';

@Service()
export class MoviesApiClient {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  getMovies(params: MoviesParams): Observable<unknown> {
    return this.http.get<unknown>(this.moviesUrl, { params: toMoviesQueryParams(params) });
  }

  getMovie(id: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.moviesUrl}/${encodeURIComponent(id)}`);
  }

  addMovie(movie: MediaDto): Observable<unknown> {
    return this.http.post<unknown>(this.moviesUrl, movie);
  }

  updateMovie(movie: MediaDto): Observable<unknown> {
    return this.http.put<unknown>(this.moviesUrl, movie);
  }

  deleteMovie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.moviesUrl}/${encodeURIComponent(id)}`);
  }

  private get moviesUrl(): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/movies`;
  }
}
