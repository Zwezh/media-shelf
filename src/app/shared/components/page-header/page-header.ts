import { Component, input } from '@angular/core';

@Component({
  selector: 'msh-page-header',
  styleUrl: './page-header.scss',
  template: `
    <header class="page-header">
      <div class="page-header__summary">
        <h1 [id]="headingId()">{{ title() }}</h1>
        <p>{{ itemCount() }} {{ itemLabel() }}</p>
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly itemCount = input.required<number>();
  readonly itemLabel = input('items');
  readonly headingId = input('page-title');
}
