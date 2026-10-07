import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthSession } from '@msh-core/auth/auth-session';
import { EmptyState } from '@msh-shared/components/empty-state/empty-state';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import type { MediaCardModel } from '@msh-shared/components/media-card/media-card.model';
import { Icon } from '@msh-shared/components/icon/icon';
import { PageHeader } from '@msh-shared/components/page-header/page-header';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Pagination } from '@msh-shared/components/pagination/pagination';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { filter, take } from 'rxjs';
import { type CollectionFilterKey, type CollectionFilters } from '../../models/collection-filters';
import { DeletionConfirmation } from '../../catalog/ui/deletion-confirmation';
import { MoviesFilterPanel, type MoviesFilterPanelData } from '../../catalog/components/movies-filter-panel/movies-filter-panel';
import { MoviesSortSelect } from '../../catalog/components/movies-sort-select/movies-sort-select';
import { MoviesRouteState } from '../state/movies-route-state';
import { MoviesStore } from '../state/movies.store';
import { toCollectionFilterChips } from '../../utils/collection-filter-chips';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, Icon, MediaCard, MoviesSortSelect, PageHeader, PageStatus, Pagination, RequiresAuth, TranslatePipe],
  providers: [MoviesRouteState, MoviesStore],
  selector: 'msh-movies',
  styleUrl: './movies.scss',
  templateUrl: './movies.html',
})
export class Movies {
  private readonly destroyRef = inject(DestroyRef);
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly movieDeletion = inject(DeletionConfirmation);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly authSession = inject(AuthSession);
  protected readonly store = inject(MoviesStore);
  protected readonly filterChips = computed(() => toCollectionFilterChips(this.store.appliedFilters()));

  protected changePage(page: number): void {
    this.store.changePage(page);
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  protected addMovie(): void {
    void this.router.navigate(['new'], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }

  protected confirmDelete(media: MediaCardModel): void {
    this.movieDeletion
      .confirm({ owner: this.destroyRef, title: media.title })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.store.deleteMovie(media.id));
  }

  protected editMovie(media: MediaCardModel): void {
    void this.router.navigate([media.id, 'edit'], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }

  protected openFilters(): void {
    this.floatingPanel
      .open<MoviesFilterPanel, MoviesFilterPanelData, CollectionFilters>(MoviesFilterPanel, {
        ariaLabelledBy: 'movies-filter-panel-title',
        data: { filters: this.store.appliedFilters() },
        owner: this.destroyRef,
        placement: 'responsive',
      })
      .closed.pipe(
        take(1),
        filter((result): result is CollectionFilters => result !== undefined),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filters) => this.store.applyFilters(filters));
  }

  protected removeFilters(keys: readonly CollectionFilterKey[]): void {
    this.store.removeFilters(keys);
  }

  protected viewMovie(media: MediaCardModel): void {
    void this.router.navigate([media.id], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }
}
