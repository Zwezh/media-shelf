import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { Media } from '@msh-features/gallery/models/media';
import { Icon } from '../icon/icon';
import { MediaBadge } from '../media-badge/media-badge';
import { MediaRating } from '../media-rating/media-rating';

@Component({
  imports: [Icon, MediaBadge, MediaRating, TranslatePipe],
  selector: 'msh-media-card',
  styleUrl: './media-card.scss',
  templateUrl: './media-card.html',
})
export class MediaCard {
  readonly media = input.required<Media>();
  readonly deleteRequested = output<Media>();
  readonly editRequested = output<Media>();
  readonly viewRequested = output<Media>();
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
