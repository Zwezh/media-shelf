import {
  DOCUMENT,
  ElementRef,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { take } from 'rxjs';
import { Icon } from '@msh-shared/components/icon/icon';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import type { CollectionSorting, CollectionSortingKey } from '../../../models/collection-sorting';
import { MoviesSortPanel, type MoviesSortPanelData, type MoviesSortPanelMode } from '../movies-sort-panel/movies-sort-panel';

const MOBILE_MEDIA_QUERY = '(max-width: 40rem)';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  selector: 'msh-movies-sort-select',
  styleUrl: './movies-sort-select.scss',
  templateUrl: './movies-sort-select.html',
})
export class MoviesSortSelect {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  readonly sorting = input.required<CollectionSorting>();
  readonly sortingChange = output<CollectionSorting>();
  readonly keys = input<readonly CollectionSortingKey[]>();
  readonly defaultSorting = input<CollectionSorting>();

  protected readonly isOpen = signal(false);
  protected readonly keyLabel = computed(() => `movies.sorting.keys.${this.sorting().key}`);

  protected open(): void {
    if (this.isOpen()) return;

    const mode = this.panelMode();
    const panelRef = this.floatingPanel.open<MoviesSortPanel, MoviesSortPanelData, CollectionSorting>(MoviesSortPanel, {
      anchor: this.trigger().nativeElement,
      ariaLabelledBy: 'movies-sort-panel-title',
      closeOnScroll: true,
      data: { mode, sorting: this.sorting(), keys: this.keys(), defaultSorting: this.defaultSorting() },
      owner: this.destroyRef,
      panelClass: 'floating-panel--movies-sort',
      placement: 'anchored-responsive',
    });
    const liveSubscription = panelRef.componentInstance?.sortingChange.subscribe((sorting) => this.sortingChange.emit(sorting));

    this.isOpen.set(true);
    panelRef.closed.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe((sorting) => {
      liveSubscription?.unsubscribe();
      this.isOpen.set(false);
      if (sorting) this.sortingChange.emit(sorting);
    });
  }

  private panelMode(): MoviesSortPanelMode {
    return this.document.defaultView?.matchMedia?.(MOBILE_MEDIA_QUERY).matches ? 'mobile' : 'desktop';
  }
}
