import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { map, Observable } from 'rxjs';
import { type MediaDto } from '../models/media.dto';
import { type MovieDetails } from '../models/movie-details';
import { type MoviesPage } from '../models/movies-page';
import { type MoviesPageDto } from '../models/movies-page.dto';
import { type MoviesParams } from '../models/movies-params';
import { toMedia } from '../utils/media.converter';
import { toMovieDetails } from '../utils/movie-details.converter';
import { type MoviesQueryParams, toMoviesQueryParams } from '../utils/movies-params';

export type GalleryEndpoint = 'movies' | 'series' | 'wishlist';

@Service()
export class GalleryApi {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  getMovies(params: MoviesParams): Observable<MoviesPage> {
    return this.http
      .get<MoviesPageDto>(this.toEndpointUrl('movies'), { params: this.toApiParams(params) })
      .pipe(map((response) => this.toMoviesPage(response, params.currentPage)));
  }

  getMovie(id: string): Observable<MovieDetails> {
    return this.http
      .get<MediaDto>(`${this.toEndpointUrl('movies')}/${encodeURIComponent(id)}`)
      .pipe(map((response) => toMovieDetails(response)));
  }

  private toEndpointUrl(endpoint: GalleryEndpoint): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/${endpoint}`;
  }

  private toMoviesPage(response: MoviesPageDto, requestedPage: number): MoviesPage {
    const currentPage = Number(response.currentPage);

    return {
      currentPage: Number.isInteger(currentPage) && currentPage >= 0 ? currentPage : requestedPage,
      media: response.list.map((item: MediaDto) => toMedia(item)),
      totalCount: response.totalCount,
    };
  }

  private toApiParams(params: MoviesParams): MoviesQueryParams {
    return toMoviesQueryParams(params);
  }
}
