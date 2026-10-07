import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { AuthSession } from '@msh-core/auth/auth-session';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { EmptyState } from '@msh-shared/components/empty-state/empty-state';
import { Icon } from '@msh-shared/components/icon/icon';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { PageHeader } from '@msh-shared/components/page-header/page-header';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Pagination } from '@msh-shared/components/pagination/pagination';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { DeletionConfirmation } from '../../catalog/ui/deletion-confirmation';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { filter, take } from 'rxjs';
import { MoviesFilterPanel, type MoviesFilterPanelData } from '../../catalog/components/movies-filter-panel/movies-filter-panel';
import { MoviesSortSelect } from '../../catalog/components/movies-sort-select/movies-sort-select';
import { CATALOG_SORTING_KEYS, DEFAULT_CATALOG_PARAMS } from '../../catalog/models/catalog-params';
import { seriesYears, toSeriesCard } from '../../catalog/utils/title-display';
import type { CollectionFilters } from '../../models/collection-filters';
import { toCollectionFilterChips } from '../../utils/collection-filter-chips';
import { SeriesRouteState } from '../state/series-route-state';
import { SeriesStore } from '../state/series.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-series',
  imports: [EmptyState, Icon, MediaCard, MoviesSortSelect, PageHeader, PageStatus, Pagination, RequiresAuth, TranslatePipe],
  providers: [SeriesRouteState, SeriesStore],
  templateUrl: './series.html',
  styleUrl: './series.scss',
})
export class Series {
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  protected readonly authSession = inject(AuthSession);
  protected readonly store = inject(SeriesStore);
  private readonly settings = inject(SettingsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly deletion = inject(DeletionConfirmation);
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
      media: toSeriesCard(title, this.settings.qualityOptions(), seriesYears(title.series, this.present(), this.unknown())),
    })),
  );
  protected readonly hasQuery = computed(() => this.store.activeFilterCount() > 0 || !!this.store.params().search);

  constructor() {
    afterNextRender(() => this.content()?.nativeElement.querySelector<HTMLElement>('h1')?.focus());
  }

  protected add(): void {
    void this.router.navigate(['new'], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }
  protected edit(id: string): void {
    void this.router.navigate([id, 'edit'], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }
  protected confirmDelete(id: string, title: string): void {
    if (this.store.isDeleting()) return;
    this.deletion.confirm({ owner: this.destroyRef, title, collection: 'series' }).subscribe(() => this.store.deleteSeries(id));
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
