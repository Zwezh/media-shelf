import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';

export const ICON_NAMES = [
  'add',
  'arrow-down',
  'arrow-up',
  'delete',
  'edit',
  'refresh',
  'filters',
  'key',
  'login',
  'logout',
  'monitor',
  'moon',
  'shield',
  'sort',
  'sort-chevron',
  'sun',
  'view',
  'visibility',
  'visibility-off',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

type IconLoader = () => Promise<string>;

@Service()
export class IconRegistry {
  private readonly document = inject(DOCUMENT);
  private readonly icons = new Map<IconName, Promise<SVGSVGElement>>();
  private readonly loaders = new Map<IconName, IconLoader>(
    ICON_NAMES.map((name): [IconName, IconLoader] => [name, (): Promise<string> => this.loadFromUrl(`/icons/${name}.svg`)]),
  );

  register(name: IconName, loader: IconLoader): void {
    this.loaders.set(name, loader);
    this.icons.delete(name);
  }

  async getIcon(name: IconName): Promise<SVGSVGElement> {
    let icon = this.icons.get(name);
    if (!icon) {
      const loader = this.loaders.get(name);
      if (!loader) throw new Error(`No SVG icon registered for "${name}".`);
      icon = loader().then((source) => this.createSvg(source, name));
      this.icons.set(name, icon);
    }

    return (await icon).cloneNode(true) as SVGSVGElement;
  }

  private createSvg(source: string, name: IconName): SVGSVGElement {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(source, 'image/svg+xml');
    const svg = parsed.documentElement;

    if (svg.tagName.toLowerCase() !== 'svg' || parsed.querySelector('parsererror')) {
      throw new Error(`The source registered for "${name}" is not valid SVG.`);
    }

    svg.querySelectorAll('script, foreignObject').forEach((element) => element.remove());
    svg.querySelectorAll('*').forEach((element) => {
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
      }
    });
    svg.querySelectorAll('[fill]').forEach((element) => {
      if (element.getAttribute('fill') !== 'none') element.setAttribute('fill', 'currentColor');
    });
    svg.querySelectorAll('[stroke]').forEach((element) => {
      if (element.getAttribute('stroke') !== 'none') element.setAttribute('stroke', 'currentColor');
    });
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    return this.document.importNode(svg, true) as unknown as SVGSVGElement;
  }

  private async loadFromUrl(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load SVG icon from "${url}".`);
    return response.text();
  }
}
