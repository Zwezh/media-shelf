import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-detail-card',
  styleUrl: './detail-card.scss',
  template: `
    <section class="detail-card" [attr.aria-labelledby]="headingId()">
      <header class="detail-card__header">
        <h2 class="text-headline-sm" [id]="headingId()">{{ titleKey() | translate }}</h2>
        <ng-content select="[detail-card-header]" />
      </header>
      <div class="detail-card__content"><ng-content /></div>
    </section>
  `,
})
export class DetailCard {
  readonly headingId = input.required<string>();
  readonly titleKey = input.required<string>();
}
