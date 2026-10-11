import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'msh-statistic-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article class="surface-card metric" [attr.data-tone]="tone()">
    <h2>{{ label() }}</h2>
    <strong class="metric__value">{{ value() }}</strong>
    <div class="metric__details"><ng-content /></div>
  </article>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .metric {
      height: 100%;
    }
    h2 {
      margin: 0;
      color: var(--color-text-muted);
      font: var(--text-label-lg);
    }
    .metric__value {
      display: block;
      margin-block: var(--space-sm) var(--space-xl);
      font: var(--text-display-lg);
      color: var(--color-primary);
    }
    .metric[data-tone='series'] .metric__value {
      color: var(--color-badge-series-text);
    }
    .metric__details {
      color: var(--color-text-muted);
      font: var(--text-body-sm);
    }
  `,
})
export class StatisticCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly tone = input<'movie' | 'series'>('movie');
}
