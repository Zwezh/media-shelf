import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-movie-editor-section',
  styleUrl: './movie-editor-section.scss',
  template: `
    <section class="editor-section" [attr.aria-labelledby]="headingId()">
      <header class="editor-section__header">
        <h2 [id]="headingId()">{{ titleKey() | translate }}</h2>
        @if (eyebrowKey()) {
          <span>{{ eyebrowKey() | translate }}</span>
        }
      </header>
      <div class="editor-section__body"><ng-content /></div>
    </section>
  `,
})
export class MovieEditorSection {
  readonly eyebrowKey = input('');
  readonly headingId = input.required<string>();
  readonly titleKey = input.required<string>();
}
