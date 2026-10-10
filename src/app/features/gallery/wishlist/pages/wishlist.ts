import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { EmptyState } from '@msh-shared/components/empty-state/empty-state';
import { Icon } from '@msh-shared/components/icon/icon';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { PageHeader } from '@msh-shared/components/page-header/page-header';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Pagination } from '@msh-shared/components/pagination/pagination';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { filter, take } from 'rxjs';
import { MoviesFilterPanel, type MoviesFilterPanelData } from '../../catalog/components/movies-filter-panel/movies-filter-panel';
import { MoviesSortSelect } from '../../catalog/components/movies-sort-select/movies-sort-select';
import { CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS } from '../../catalog/models/catalog-params';
import { toTitleCard } from '../../catalog/utils/title-display';
import type { CollectionFilters } from '../../models/collection-filters';
import { toCollectionFilterChips } from '../../utils/collection-filter-chips';
import { CatalogRouteState } from '../../catalog/state/catalog-route-state';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { DeletionConfirmation } from '../../catalog/ui/deletion-confirmation';
import { WishlistAddDialog } from '../components/wishlist-add-dialog';
import { WishlistStore } from '../state/wishlist.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-wishlist',
  imports: [EmptyState, Icon, MediaCard, MoviesSortSelect, PageHeader, PageStatus, Pagination, RequiresAuth, TranslatePipe],
  providers: [CatalogRouteState, WishlistStore],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist {
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  protected readonly store = inject(WishlistStore);
  private readonly deletion = inject(DeletionConfirmation);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly destroyRef = inject(DestroyRef);
  private readonly present = translate('series.present');
  private readonly unknown = translate('series.unknown');
  protected readonly sortingKeys = CATALOG_SORTING_KEYS;
  protected readonly defaultSorting = { key: DEFAULT_CATALOG_PARAMS.key, direction: DEFAULT_CATALOG_PARAMS.direction };
  protected readonly filterChips = computed(() => toCollectionFilterChips(this.store.filters()));
  protected readonly cards = computed(() =>
    this.store.titles().map((title) => ({
      title,
      media: toTitleCard(title, { present: this.present(), unknown: this.unknown() }),
    })),
  );
  protected readonly hasQuery = computed(() => this.store.activeFilterCount() > 0 || !!this.store.params().search);

  constructor() {
    afterNextRender(() => this.content()?.nativeElement.querySelector<HTMLElement>('h1')?.focus());
  }

  protected add(): void {
    this.floatingPanel
      .open<WishlistAddDialog, undefined, string>(WishlistAddDialog, {
        ariaLabelledBy: 'wishlist-add-title',
        owner: this.destroyRef,
        placement: 'center',
        closeOnBackdrop: false,
        closeOnEscape: true,
      })
      .closed.pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        if (id) this.view(id);
      });
  }
  protected confirmDelete(id: string, title: string): void {
    if (this.store.pendingIds().includes(id)) return;
    this.deletion.confirm({ owner: this.destroyRef, title, collection: 'wishlist' }).subscribe(() => void this.store.deleteItem(id));
  }
  protected view(id: string): void {
    void this.router.navigate([id], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }

  protected openFilters(): void {
    this.floatingPanel
      .open<MoviesFilterPanel, MoviesFilterPanelData, CollectionFilters>(MoviesFilterPanel, {
        ariaLabelledBy: 'movies-filter-panel-title',
        data: { filters: this.store.filters() },
        owner: this.destroyRef,
        placement: 'responsive',
      })
      .closed.pipe(
        take(1),
        filter((value): value is CollectionFilters => value !== undefined),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.store.applyFilters(value));
  }
}
