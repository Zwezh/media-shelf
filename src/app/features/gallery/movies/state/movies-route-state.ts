import { inject, Service } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { type MoviesParams } from '../../models/movies-params';
import { readMoviesParams, toMoviesQueryParams } from '../../utils/movies-params';

@Service({ autoProvided: false })
export class MoviesRouteState {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly query = this.route.queryParamMap.pipe(
    map(readMoviesParams),
    distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
  );

  navigate(params: MoviesParams, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toMoviesQueryParams(params),
      ...(replaceUrl ? { replaceUrl: true } : {}),
    });
  }
}
