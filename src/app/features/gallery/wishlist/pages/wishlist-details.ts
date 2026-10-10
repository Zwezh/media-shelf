import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { MovieDetailsHero } from '../../catalog/components/movie-details-hero/movie-details-hero';
import { ProductionAndCast } from '../../catalog/components/production-and-cast/production-and-cast';
import { RelatedMovieLists } from '../../catalog/components/related-movie-lists/related-movie-lists';
import { toTitleDetailsView } from '../../catalog/utils/title-display';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { DeletionConfirmation } from '../../catalog/ui/deletion-confirmation';
import { WishlistDetailsStore } from '../state/wishlist-details.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-wishlist-details',
  imports: [MovieDetailsHero, PageStatus, ProductionAndCast, RelatedMovieLists, RouterLink, RequiresAuth, TranslatePipe],
  providers: [WishlistDetailsStore],
  templateUrl: './wishlist-details.html',
  styleUrl: './wishlist-details.scss',
})
export class WishlistDetails {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly deletion = inject(DeletionConfirmation);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly store = inject(WishlistDetailsStore);
  private readonly present = translate('series.present');
  private readonly unknown = translate('series.unknown');
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  protected readonly details = computed(() => {
    const title = this.store.title();
    return title ? toTitleDetailsView(title, { present: this.present(), unknown: this.unknown() }) : null;
  });
  protected async refresh(button: HTMLButtonElement): Promise<void> {
    const id = this.store.title()?.id;
    const focused = this.document.activeElement === button;
    await this.store.refresh();
    if (this.destroyRef.destroyed) return;
    afterNextRender(
      () => {
        if (focused && button.isConnected && this.store.title()?.id === id && this.document.activeElement === this.document.body)
          button.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
  protected addToLibrary(): void {
    const title = this.store.title();
    if (!title || this.store.pending()) return;
    void this.router.navigate(['/gallery', title.kind === 'series' ? 'series' : 'movies', 'new'], {
      queryParams: { ...this.route.snapshot.queryParams, wishlistId: title.id },
    });
  }
  protected confirmDelete(): void {
    const title = this.store.title();
    if (!title || this.store.pending()) return;
    this.deletion
      .confirm({ owner: this.destroyRef, title: title.title, collection: 'wishlist' })
      .subscribe(() => void this.store.deleteItem());
  }
  private focusedId: string | null = null;
  constructor() {
    afterRenderEffect(() => {
      const title = this.store.title();
      if (title && title.id !== this.focusedId) {
        this.focusedId = title.id;
        this.content()?.nativeElement.querySelector<HTMLElement>('h1')?.focus();
      } else if (!title) this.focusedId = null;
    });
  }
}
