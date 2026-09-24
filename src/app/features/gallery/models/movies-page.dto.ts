import { type MediaDto } from './media.dto';

export type MoviesPageDto = {
  currentPage: number | string;
  list: MediaDto[];
  totalCount: number;
};
