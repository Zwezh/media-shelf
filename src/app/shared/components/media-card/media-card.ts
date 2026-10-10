import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { Icon } from '../icon/icon';
import { MediaBadge } from '../media-badge/media-badge';
import { MediaRating } from '../media-rating/media-rating';
import type { MediaCardModel } from './media-card.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, MediaBadge, MediaRating, RequiresAuth, TranslatePipe],
  selector: 'msh-media-card',
  styleUrl: './media-card.scss',
  templateUrl: './media-card.html',
})
export class MediaCard {
  readonly showTypeBadge = input(false);
  readonly wrapBadges = input(false);
  readonly showQuality = input(true);
  readonly refreshDisabled = input(false);
  readonly actionsDisabled = input(false);
  readonly actions = input<readonly ('view' | 'edit' | 'delete' | 'refresh')[]>(['view', 'edit', 'delete']);
  readonly media = input.required<MediaCardModel>();
  readonly deleteRequested = output<MediaCardModel>();
  readonly refreshRequested = output<MediaCardModel>();
  readonly editRequested = output<MediaCardModel>();
  readonly viewRequested = output<MediaCardModel>();
  private readonly untitled = translate('media.untitled');
  protected readonly displayTitle = computed(() => this.media().title || this.untitled());
  protected readonly genresLabel = computed(() => this.media().genres.slice(0, 2).join(', '));
  protected readonly durationParams = computed(() => ({
    hours: Math.floor((this.media().durationMinutes ?? 0) / 60),
    minutes: (this.media().durationMinutes ?? 0) % 60,
  }));

  protected usePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(MEDIA_POSTER_PLACEHOLDER)) {
      image.src = MEDIA_POSTER_PLACEHOLDER;
    }
  }
}
