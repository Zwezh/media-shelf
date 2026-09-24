import { type Media } from './media';

export type MoviesPage = {
  readonly currentPage: number;
  readonly media: readonly Media[];
  readonly totalCount: number;
};
