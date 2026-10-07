import { toCollectionQueryParams, type CollectionQueryParams } from '../data-access/collection-query-params';
import { type ParamMap } from '@angular/router';
import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import { type MoviesParams } from '../models/movies-params';
import { readCollectionParams } from './collection-params';
import { SORTING_KEYS } from '../models/sorting-key';

export const DEFAULT_MOVIES_PARAMS: MoviesParams = {
  currentPage: 0,
  direction: 'desc',
  key: 'addedDate',
  pageSize: DEFAULT_PAGE_SIZE,
};

export type MoviesQueryParams = CollectionQueryParams;

export function readMoviesParams(paramMap: ParamMap): MoviesParams {
  return readCollectionParams(paramMap, SORTING_KEYS, DEFAULT_MOVIES_PARAMS);
}
export function toMoviesQueryParams(params: MoviesParams): MoviesQueryParams {
  return toCollectionQueryParams(params);
}
