export type CollectionPage<T> = {
  readonly currentPage: number;
  readonly media: readonly T[];
  readonly totalCount: number;
};

export type CollectionPageDto<T> = {
  currentPage: number | string;
  list: T[];
  totalCount: number;
};
