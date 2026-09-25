import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { EmptyState } from '@msh-shared/components/empty-state/empty-state';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { Icon } from '@msh-shared/components/icon/icon';
import { PageHeader } from '@msh-shared/components/page-header/page-header';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Pagination } from '@msh-shared/components/pagination/pagination';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { filter, take } from 'rxjs';
import { type MovieFilterKey, type MoviesFilters } from '../../models/movies-filters';
import { type Media } from '../../models/media';
import { MoviesFilterPanel, type MoviesFilterPanelData } from '../components/movies-filter-panel/movies-filter-panel';
import { MoviesSortSelect } from '../components/movies-sort-select/movies-sort-select';
import { MoviesStore } from '../data-access/movies.store';

type FilterChip = {
  readonly key: MovieFilterKey;
  readonly filterKeys: readonly MovieFilterKey[];
  readonly labelKey: string;
  readonly value: string;
};

@Component({
  imports: [EmptyState, Icon, MediaCard, MoviesSortSelect, PageHeader, PageStatus, Pagination, TranslatePipe],
  providers: [MoviesStore],
  selector: 'msh-movies',
  styleUrl: './movies.scss',
  templateUrl: './movies.html',
})
export class Movies {
  private readonly destroyRef = inject(DestroyRef);
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(MoviesStore);
  protected readonly filterChips = computed<readonly FilterChip[]>(() => toFilterChips(this.store.appliedFilters()));

  protected changePage(page: number): void {
    this.store.changePage(page);
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  protected openFilters(): void {
    this.floatingPanel
      .open<MoviesFilterPanel, MoviesFilterPanelData, MoviesFilters>(MoviesFilterPanel, {
        ariaLabelledBy: 'movies-filter-panel-title',
        data: { filters: this.store.appliedFilters() },
        placement: 'responsive',
      })
      .closed.pipe(
        take(1),
        filter((result): result is MoviesFilters => result !== undefined),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filters) => this.store.applyFilters(filters));
  }

  protected removeFilters(keys: readonly MovieFilterKey[]): void {
    this.store.removeFilters(keys);
  }

  protected viewMovie(media: Media): void {
    void this.router.navigate([media.id], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }
}

function toFilterChips(filters: MoviesFilters): FilterChip[] {
  return [
    ...(filters.genres?.length
      ? [
          {
            key: 'genres' as const,
            filterKeys: ['genres' as const],
            labelKey: 'movies.filters.genreChip',
            value: filters.genres.join(', '),
          },
        ]
      : []),
    ...(filters.fromYear || filters.toYear
      ? [
          {
            key: 'fromYear' as const,
            filterKeys: ['fromYear' as const, 'toYear' as const],
            labelKey: 'movies.filters.yearsChip',
            value: `${filters.fromYear ?? '…'}–${filters.toYear ?? '…'}`,
          },
        ]
      : []),
    ...(filters.rating
      ? [
          {
            key: 'rating' as const,
            filterKeys: ['rating' as const],
            labelKey: 'movies.filters.ratingChip',
            value: `${filters.rating}+`,
          },
        ]
      : []),
    ...(filters.ageRating?.length
      ? [
          {
            key: 'ageRating' as const,
            filterKeys: ['ageRating' as const],
            labelKey: 'movies.filters.ageChip',
            value: filters.ageRating.map((rating) => `${rating}+`).join(', '),
          },
        ]
      : []),
    ...(filters.quality?.length
      ? [
          {
            key: 'quality' as const,
            filterKeys: ['quality' as const],
            labelKey: 'movies.filters.qualityChip',
            value: filters.quality.join(', '),
          },
        ]
      : []),
    ...(filters.actors
      ? [
          {
            key: 'actors' as const,
            filterKeys: ['actors' as const],
            labelKey: 'movies.filters.actorsChip',
            value: filters.actors,
          },
        ]
      : []),
    ...(filters.directors
      ? [
          {
            key: 'directors' as const,
            filterKeys: ['directors' as const],
            labelKey: 'movies.filters.directorsChip',
            value: filters.directors,
          },
        ]
      : []),
  ];
}
