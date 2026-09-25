import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-media-rating',
  template: `<span
    class="rating"
    [class.rating--inverse]="tone() === 'inverse'"
    [attr.aria-label]="'media.ratingLabel' | translate: { rating: formattedRating() }"
    ><span aria-hidden="true">★</span> {{ formattedRating() }}</span
  >`,
  styles: `
    .rating {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      color: var(--color-badge-rating-text);
      font: var(--text-label-md);
      white-space: nowrap;
    }
    .rating--inverse {
      color: var(--color-text-inverse);
    }
    .rating span {
      color: var(--color-rating);
      font-size: 0.875rem;
    }
  `,
})
export class MediaRating {
  readonly rating = input.required<number>();
  readonly tone = input<'default' | 'inverse'>('default');
  protected readonly formattedRating = computed(() => this.rating().toFixed(1));
}
