import { Component, inject } from '@angular/core';
import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import { TranslatePipe } from '@ngx-translate/core';
import { EmptyState } from '@msh-shared/components/empty-state/empty-state';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { PageHeader } from '@msh-shared/components/page-header/page-header';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Pagination } from '@msh-shared/components/pagination/pagination';
import { MoviesStore } from '../data-access/movies.store';

@Component({
  imports: [EmptyState, MediaCard, PageHeader, PageStatus, Pagination, TranslatePipe],
  providers: [MoviesStore],
  selector: 'msh-movies',
  styleUrl: './movies.scss',
  templateUrl: './movies.html',
})
export class Movies {
  protected readonly pageSize = DEFAULT_PAGE_SIZE;
  protected readonly store = inject(MoviesStore);

  protected changePage(page: number): void {
    this.store.changePage(page);
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  }
}
