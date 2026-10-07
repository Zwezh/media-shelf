import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '@msh-shared/components/icon/icon';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import type { CollectionSorting } from '../../../models/collection-sorting';
import { type SortingDirection } from '../../../models/sorting-direction';
import { SORTING_KEYS } from '../../../models/sorting-key';
import type { CollectionSortingKey } from '../../../models/collection-sorting';
import { DEFAULT_MOVIES_PARAMS } from '../../../utils/movies-params';

export type MoviesSortPanelMode = 'desktop' | 'mobile';

export type MoviesSortPanelData = {
  readonly mode: MoviesSortPanelMode;
  readonly sorting: CollectionSorting;
  readonly keys?: readonly CollectionSortingKey[];
  readonly defaultSorting?: CollectionSorting;
};

type SortOption = {
  readonly key: CollectionSortingKey;
  readonly labelKey: string;
};

const SORT_OPTIONS: readonly SortOption[] = SORTING_KEYS.map((key) => ({
  key,
  labelKey: `movies.sorting.keys.${key}`,
}));

const DEFAULT_SORTING: CollectionSorting = {
  direction: DEFAULT_MOVIES_PARAMS.direction,
  key: DEFAULT_MOVIES_PARAMS.key,
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  selector: 'msh-movies-sort-panel',
  styleUrls: ['./movies-sort-panel.scss', './movies-sort-panel-mobile.scss'],
  templateUrl: './movies-sort-panel.html',
})
export class MoviesSortPanel {
  private readonly data = inject(FLOATING_PANEL_DATA) as MoviesSortPanelData;
  private readonly panelRef = inject<FloatingPanelRef<CollectionSorting>>(FloatingPanelRef);

  readonly sortingChange = output<CollectionSorting>();

  protected readonly initialSorting = this.data.sorting;
  protected readonly mode = this.data.mode;
  protected readonly options = this.data.keys?.map((key) => ({ key, labelKey: `movies.sorting.keys.${key}` })) ?? SORT_OPTIONS;
  protected readonly sorting = signal<CollectionSorting>({ ...this.data.sorting });
  protected readonly canApply = computed(() => !sameSorting(this.sorting(), this.initialSorting));

  protected close(): void {
    this.panelRef.close();
  }

  protected selectDirection(direction: SortingDirection): void {
    this.updateSorting({ ...this.sorting(), direction });
  }

  protected selectKey(key: CollectionSortingKey): void {
    this.updateSorting({ ...this.sorting(), key });
  }

  protected reset(): void {
    this.updateSorting(this.data.defaultSorting ?? DEFAULT_SORTING);
  }

  protected apply(): void {
    if (!this.canApply()) return;
    this.panelRef.close(this.sorting());
  }

  protected hintKey(option: SortOption): string {
    return `movies.sorting.hints.${option.key}.${this.sorting().direction}`;
  }

  private updateSorting(sorting: CollectionSorting): void {
    if (sameSorting(sorting, this.sorting())) return;
    this.sorting.set({ ...sorting });
    if (this.mode === 'desktop') this.sortingChange.emit(this.sorting());
  }
}

function sameSorting(left: CollectionSorting, right: CollectionSorting): boolean {
  return left.direction === right.direction && left.key === right.key;
}
