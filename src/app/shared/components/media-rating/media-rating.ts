import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-media-rating',
  template: `<span class="rating" [attr.aria-label]="'media.ratingLabel' | translate: { rating: formattedRating() }"
    ><span aria-hidden="true">★</span> {{ formattedRating() }}</span
  >`,
  styles: `
    .rating {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      color: var(--color-text-inverse);
      font: var(--text-label-md);
      white-space: nowrap;
    }
    .rating span {
      color: var(--color-rating);
      font-size: 0.875rem;
    }
  `,
})
export class MediaRating {
  readonly rating = input.required<number>();
  protected readonly formattedRating = computed(() => this.rating().toFixed(1));
}
