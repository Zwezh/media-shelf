import { Component } from '@angular/core';

@Component({
  selector: 'msh-gallery',
  template: `
    <section class="feature-placeholder" aria-labelledby="gallery-title">
      <h1 id="gallery-title">Gallery</h1>
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
