import { inject, Service } from '@angular/core';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS, type CatalogParams } from '../../catalog/models/catalog-params';
import { toCollectionQueryParams } from '../../data-access/collection-query-params';
import { readCollectionParams } from '../../utils/collection-params';

export function readCatalogParams(params: ParamMap): CatalogParams {
  return readCollectionParams(params, CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS);
}

@Service({ autoProvided: false })
export class SeriesRouteState {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly query = this.route.queryParamMap.pipe(
    map(readCatalogParams),
    distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
  );

  navigate(params: CatalogParams, replaceUrl = false): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: toCollectionQueryParams(params), replaceUrl });
  }
}
