import { computed } from '@angular/core';
import { translate } from '@ngx-translate/core';
import { galleryCard, galleryItemRoute } from '../catalog/utils/gallery-display';
import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { MediaBadge } from '@msh-shared/components/media-badge/media-badge';
import { QuickSearchStore } from './quick-search.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'handleDocumentClick($event)',
    '(document:keydown)': 'handleDocumentKeydown($event)',
  },
  imports: [MediaBadge, RouterLink, TranslatePipe],
  providers: [QuickSearchStore],
  selector: 'msh-quick-search',
  styleUrl: './quick-search.scss',
  templateUrl: './quick-search.html',
})
export class QuickSearch {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  protected readonly store = inject(QuickSearchStore);
  private readonly present = translate('series.present');
  private readonly unknown = translate('series.unknown');
  protected readonly cards = computed(() =>
    this.store.media().map((item) => ({
      ...galleryCard(item, { present: this.present(), unknown: this.unknown() }),
      collection: item.collection,
      route: galleryItemRoute(item),
    })),
  );

  protected applySearch(): void {
    if (!this.store.canApply()) return;

    this.store.close();
    void this.router.navigate(['/gallery'], {
      queryParams: { search: this.store.query().trim() },
    });
  }

  protected close(): void {
    this.store.close();
  }

  protected handleDocumentClick(event: Event): void {
    if (event.target instanceof Node && !this.element.nativeElement.contains(event.target)) this.store.close();
  }

  protected handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.store.isOpen()) {
      this.store.close();
      this.searchInput().nativeElement.blur();
      return;
    }
  }

  protected search(event: Event): void {
    this.store.search((event.target as HTMLInputElement).value);
  }

  protected useFallbackPoster(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(MEDIA_POSTER_PLACEHOLDER)) image.src = MEDIA_POSTER_PLACEHOLDER;
  }
}
