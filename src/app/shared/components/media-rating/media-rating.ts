import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'msh-media-rating',
  template: `<span class="rating" [attr.aria-label]="label()"><span aria-hidden="true">★</span> {{ formattedRating() }}</span>`,
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
  protected readonly label = computed(() => `Rating ${this.formattedRating()} out of 10`);
}
