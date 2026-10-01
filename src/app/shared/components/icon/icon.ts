import { Component, effect, ElementRef, inject, input, numberAttribute, ViewEncapsulation } from '@angular/core';
import { IconName, IconRegistry } from './icon-registry';

export type { IconName } from './icon-registry';

@Component({
  encapsulation: ViewEncapsulation.None,
  host: {
    'aria-hidden': 'true',
    '[style.color]': 'color()',
    '[style.height.px]': 'size()',
    '[style.width.px]': 'size()',
  },
  selector: 'msh-icon',
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
    }

    msh-icon > svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  template: '',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(14, { transform: numberAttribute });
  readonly color = input<string>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly registry = inject(IconRegistry);

  constructor() {
    effect((onCleanup) => {
      const name = this.name();
      const host = this.element.nativeElement;
      let active = true;

      host.replaceChildren();
      host.dataset['loading'] = 'true';
      void this.registry
        .getIcon(name)
        .then((svg) => {
          if (!active) return;
          host.replaceChildren(svg);
          delete host.dataset['loading'];
          delete host.dataset['error'];
        })
        .catch(() => {
          if (!active) return;
          delete host.dataset['loading'];
          host.dataset['error'] = name;
        });

      onCleanup(() => {
        active = false;
      });
    });
  }
}
