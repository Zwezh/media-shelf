import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type MediaBadgeTone = 'movie' | 'series' | 'quality' | 'age' | 'wishlist';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-media-badge',
  styleUrl: './media-badge.scss',
  template: `<span class="badge badge--{{ tone() }}"><ng-content /></span>`,
})
export class MediaBadge {
  readonly tone = input<MediaBadgeTone>('quality');
}
