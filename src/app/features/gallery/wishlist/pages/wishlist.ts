import { Component } from '@angular/core';

@Component({
  selector: 'msh-wishlist',
  template: `
    <section class="feature-placeholder" aria-labelledby="wishlist-title">
      <h1 id="wishlist-title">Wishlist</h1>
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
export class Wishlist {}
