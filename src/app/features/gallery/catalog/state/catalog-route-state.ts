import { PRODUCTION_STATUSES } from '../../models/production-status';
import { inject, Service } from '@angular/core';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS, type CatalogParams } from '../models/catalog-params';
import { toCollectionQueryParams } from '../../data-access/collection-query-params';
import { readCollectionParams } from '../../utils/collection-params';

export function readCatalogParams(params: ParamMap, seriesFilters = false): CatalogParams {
  const common = readCollectionParams(params, CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS);
  if (!seriesFilters) return common;
  const productionStatus = PRODUCTION_STATUSES.find((status) => status === params.get('productionStatus'));
  return {
    ...common,
    ...(productionStatus ? { productionStatus } : {}),
    ...(params.get('seasonAvailability') === 'incomplete' ? { seasonAvailability: 'incomplete' as const } : {}),
  };
}

@Service({ autoProvided: false })
export class CatalogRouteState {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly query = this.route.queryParamMap.pipe(
    map((params) => readCatalogParams(params, this.route.snapshot?.data?.['seriesFilters'] === true)),
    distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
  );

  navigate(params: CatalogParams, replaceUrl = false): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: toCollectionQueryParams(params), replaceUrl });
  }
}
