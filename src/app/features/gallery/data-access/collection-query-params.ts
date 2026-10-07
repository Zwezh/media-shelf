import type { CollectionParams } from '../models/collection-params';

export type CollectionQueryParams = Record<string, number | string | readonly (number | string)[]>;

export function toCollectionQueryParams(params: CollectionParams<string>): CollectionQueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && (!Array.isArray(value) || value.length > 0)),
  ) as CollectionQueryParams;
}
