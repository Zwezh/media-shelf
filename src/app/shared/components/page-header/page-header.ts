import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-page-header',
  styleUrl: './page-header.scss',
  template: `
    <header class="page-header">
      <div class="page-header__summary">
        <h1 [id]="headingId()">{{ titleKey() | translate }}</h1>
        <p>{{ 'common.itemCount' | translate: { count: itemCount() } }}</p>
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly titleKey = input.required<string>();
  readonly itemCount = input.required<number>();
  readonly headingId = input('page-title');
}
