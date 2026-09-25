import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export type IconName = 'arrow-down' | 'arrow-up' | 'filters' | 'sort' | 'sort-chevron';

@Component({
  host: { 'aria-hidden': 'true' },
  imports: [NgOptimizedImage],
  selector: 'msh-icon',
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
    }

    img {
      display: block;
    }
  `,
  template: '<img alt="" loading="lazy" [height]="size()" [ngSrc]="source()" [width]="size()" />',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(14);

  protected readonly source = computed(() => `/icons/${this.name()}.svg`);
}
