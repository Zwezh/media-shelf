import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'msh-statistics-chart-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `<section class="surface-card" [attr.aria-labelledby]="headingId()">
    <h2 [id]="headingId()">{{ titleKey() | translate }}</h2>
    <p class="description">{{ descriptionKey() | translate }}</p>
    <ng-content />
  </section>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    section {
      height: 100%;
    }
    h2 {
      margin: 0;
      font: var(--text-headline-md);
    }
    .description {
      margin-block: var(--space-xs) var(--space-xl);
      color: var(--color-text-muted);
      font: var(--text-body-sm);
    }
  `,
})
export class StatisticsChartPanel {
  readonly headingId = input.required<string>();
  readonly titleKey = input.required<string>();
  readonly descriptionKey = input.required<string>();
}
