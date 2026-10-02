import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Icon } from './icon';
import { IconRegistry } from './icon-registry';

describe('Icon', () => {
  let fixture: ComponentFixture<Icon>;

  beforeEach(async () => {
    const registry = {
      getIcon: vi.fn(async () => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        return svg;
      }),
    };
    TestBed.configureTestingModule({ providers: [{ provide: IconRegistry, useValue: registry }] });
    fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', 'filters');
    fixture.componentRef.setInput('size', 18);
    await fixture.whenStable();
  });

  it('loads and inserts the named SVG at the requested size', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(TestBed.inject(IconRegistry).getIcon).toHaveBeenCalledWith('filters');
    expect(element.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(element.style.width).toBe('18px');
    expect(element.style.height).toBe('18px');
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });
});
