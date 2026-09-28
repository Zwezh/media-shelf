import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { Icon } from '../icon/icon';
import { MediaBadge } from '../media-badge/media-badge';
import { MediaRating } from '../media-rating/media-rating';
import type { MediaCardModel } from './media-card.model';

@Component({
  imports: [Icon, MediaBadge, MediaRating, TranslatePipe],
  selector: 'msh-media-card',
  styleUrl: './media-card.scss',
  templateUrl: './media-card.html',
})
export class MediaCard {
  readonly actionsDisabled = input(false);
  readonly media = input.required<MediaCardModel>();
  readonly deleteRequested = output<MediaCardModel>();
  readonly editRequested = output<MediaCardModel>();
  readonly viewRequested = output<MediaCardModel>();
  private readonly untitled = translate('media.untitled');
  protected readonly displayTitle = computed(() => this.media().title || this.untitled());
  protected readonly durationParams = computed(() => ({
    hours: Math.floor(this.media().durationMinutes / 60),
    minutes: this.media().durationMinutes % 60,
  }));

  protected usePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(MEDIA_POSTER_PLACEHOLDER)) {
      image.src = MEDIA_POSTER_PLACEHOLDER;
    }
  }
}
