import { SettingsStore } from '@msh-core/settings/settings.store';
import { MediaBadge } from '@msh-shared/components/media-badge/media-badge';
import type { GalleryItem } from '../models/gallery-item';
import { galleryCard, galleryItemRoute } from '../utils/gallery-display';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { EmptyState } from '@msh-shared/components/empty-state/empty-state';
import { Icon } from '@msh-shared/components/icon/icon';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { PageHeader } from '@msh-shared/components/page-header/page-header';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Pagination } from '@msh-shared/components/pagination/pagination';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { filter, take } from 'rxjs';
import { MoviesFilterPanel, type MoviesFilterPanelData } from '../components/movies-filter-panel/movies-filter-panel';
import { MoviesSortSelect } from '../components/movies-sort-select/movies-sort-select';
import { CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS } from '../models/catalog-params';
import type { CollectionFilters } from '../../models/collection-filters';
import { toCollectionFilterChips } from '../../utils/collection-filter-chips';
import { GalleryRouteState } from '../state/gallery-route-state';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { DeletionConfirmation } from '../ui/deletion-confirmation';
import { WishlistAddDialog } from '../../wishlist/components/wishlist-add-dialog';
import { GalleryStore } from '../state/gallery.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-gallery-list',
  imports: [EmptyState, Icon, MediaCard, MoviesSortSelect, PageHeader, PageStatus, Pagination, RequiresAuth, TranslatePipe, MediaBadge],
  providers: [GalleryRouteState, GalleryStore],
  templateUrl: './gallery-list.html',
  styleUrl: './gallery-list.scss',
})
export class GalleryList {
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  protected readonly store = inject(GalleryStore);
  private readonly deletion = inject(DeletionConfirmation);
  private readonly router = inject(Router);
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly destroyRef = inject(DestroyRef);
  private readonly settings = inject(SettingsStore);
  private readonly present = translate('series.present');
  private readonly unknown = translate('series.unknown');
  protected readonly sortingKeys = CATALOG_SORTING_KEYS;
  protected readonly defaultSorting = { key: DEFAULT_CATALOG_PARAMS.key, direction: DEFAULT_CATALOG_PARAMS.direction };
  protected readonly filterChips = computed(() => toCollectionFilterChips(this.store.filters()));
  protected readonly cards = computed(() =>
    this.store.titles().map((title) => ({
      title,
      media: galleryCard(title, { present: this.present(), unknown: this.unknown() }, this.settings.qualityOptions()),
    })),
  );
  protected readonly hasQuery = computed(
    () =>
      this.store.activeFilterCount() > 0 ||
      !!this.store.params().search ||
      !!this.store.params().collections ||
      !!this.store.params().kinds,
  );

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
        if (id) void this.router.navigate(['/gallery/wishlist', id]);
      });
  }
  protected confirmDelete(item: GalleryItem): void {
    if (this.store.pendingIds().includes(item.id)) return;
    this.deletion
      .confirm({ owner: this.destroyRef, title: item.title, collection: item.collection })
      .subscribe(() => void this.store.deleteItem(item));
  }
  protected view(item: GalleryItem): void {
    void this.router.navigate([...galleryItemRoute(item)], { queryParams: { search: this.store.params().search } });
  }
  protected edit(item: GalleryItem): void {
    void this.router.navigate([...galleryItemRoute(item), 'edit'], { queryParams: { search: this.store.params().search } });
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
