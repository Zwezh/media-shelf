import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export type IconName = 'arrow-down' | 'arrow-up' | 'delete' | 'edit' | 'filters' | 'sort' | 'sort-chevron' | 'view';

const ICON_ASPECT_RATIOS: Readonly<Record<IconName, number>> = {
  'arrow-down': 1,
  'arrow-up': 1,
  delete: 1,
  edit: 1,
  filters: 1,
  sort: 1,
  'sort-chevron': 9 / 14,
  view: 1,
};

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
  template: '<img alt="" loading="lazy" [height]="size()" [ngSrc]="source()" [width]="width()" />',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(14);

  protected readonly source = computed(() => `/icons/${this.name()}.svg`);
  protected readonly width = computed(() => Math.round(this.size() * ICON_ASPECT_RATIOS[this.name()]));
}
