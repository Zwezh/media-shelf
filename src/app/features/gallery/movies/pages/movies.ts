import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { DEFAULT_PAGE_SIZE } from '@msh-core/config/media';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { PageHeader } from '@msh-shared/components/page-header/page-header';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Pagination } from '@msh-shared/components/pagination/pagination';
import { MediaDto } from '../../models/media.dto';
import { toMedia } from '../../utils/media.converter';

@Component({
  imports: [MediaCard, PageHeader, PageStatus, Pagination],
  selector: 'msh-movies',
  styleUrl: './movies.scss',
  templateUrl: './movies.html',
})
export class Movies {
  protected readonly pageSize = DEFAULT_PAGE_SIZE;
  protected readonly page = signal(1);
  private readonly mediaResource = httpResource<MediaDto[]>(() => '/mock-data.json', { defaultValue: [] });
  protected readonly media = computed(() => (this.mediaResource.hasValue() ? this.mediaResource.value().map(toMedia) : []));
  protected readonly visibleMedia = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.media().slice(start, start + this.pageSize);
  });
  protected readonly isLoading = this.mediaResource.isLoading;
  protected readonly error = this.mediaResource.error;

  protected changePage(page: number): void {
    this.page.set(page);
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  }
}
