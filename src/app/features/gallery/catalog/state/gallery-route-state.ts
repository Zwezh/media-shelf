import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { readCatalogParams } from './catalog-route-state';
import { toCollectionQueryParams } from '../../data-access/collection-query-params';
import { GALLERY_COLLECTIONS, GALLERY_KINDS, type GalleryParams } from '../models/gallery-item';
export function readGalleryParams(params: ParamMap): GalleryParams {
  const scope = <T extends string>(key: string, allowed: readonly T[]): readonly T[] | undefined => {
    const input = params.getAll(key).flatMap((v) => v.split(',').map((value) => value.trim()));
    const values = allowed.filter((v) => input.includes(v));
    return !values.length || values.length === allowed.length ? undefined : values;
  };
  return { ...readCatalogParams(params), collections: scope('collections', GALLERY_COLLECTIONS), kinds: scope('kinds', GALLERY_KINDS) };
}
@Injectable()
export class GalleryRouteState {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly query = this.route.queryParamMap.pipe(
    map(readGalleryParams),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );
  navigate(params: GalleryParams, replaceUrl = false): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: toCollectionQueryParams(params), replaceUrl });
  }
}
