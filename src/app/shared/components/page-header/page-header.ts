import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type PageHeaderBadgeTone = 'movie' | 'neutral' | 'series' | 'wishlist';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  selector: 'msh-page-header',
  styleUrl: './page-header.scss',
  template: `
    <header class="page-header">
      <div class="page-header__summary">
        <h1 class="text-headline-lg" [id]="headingId()" tabindex="-1">{{ titleKey() | translate }}</h1>
        <p class="text-label-lg page-header__count page-header__count--{{ badgeTone() }}">
          {{ 'common.itemCount' | translate: { count: itemCount() } }}
        </p>
      </div>
      <div class="btn-group btn-group-uniform page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly titleKey = input.required<string>();
  readonly itemCount = input.required<number>();
  readonly headingId = input('page-title');
  readonly badgeTone = input<PageHeaderBadgeTone>('neutral');
}
