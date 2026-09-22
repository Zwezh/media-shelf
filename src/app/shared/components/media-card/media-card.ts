import { Component, input } from '@angular/core';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { Media } from '@msh-features/gallery/models/media';
import { MediaBadge } from '../media-badge/media-badge';
import { MediaRating } from '../media-rating/media-rating';

@Component({
  imports: [MediaBadge, MediaRating],
  selector: 'msh-media-card',
  styleUrl: './media-card.scss',
  templateUrl: './media-card.html',
})
export class MediaCard {
  readonly media = input.required<Media>();

  protected usePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(MEDIA_POSTER_PLACEHOLDER)) {
      image.src = MEDIA_POSTER_PLACEHOLDER;
    }
  }
}
