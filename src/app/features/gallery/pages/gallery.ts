import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-gallery',
  template: `
    <section class="feature-placeholder" aria-labelledby="gallery-title">
      <h1 id="gallery-title">{{ 'navigation.gallery' | translate }}</h1>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .feature-placeholder {
      padding: var(--space-2xl);
      color: var(--color-text-primary);
    }

    h1 {
      margin: 0;
      font: var(--text-display-lg);
      letter-spacing: 0;
    }
  `,
})
export class Gallery {}
