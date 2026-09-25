import { type SortingDirection } from './sorting-direction';
import { type SortingKey } from './sorting-key';

export type MoviesSorting = {
  readonly direction: SortingDirection;
  readonly key: SortingKey;
};
