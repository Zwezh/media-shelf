import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Icon } from './icon';

describe('Icon', () => {
  let fixture: ComponentFixture<Icon>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', 'filters');
    fixture.componentRef.setInput('size', 18);
    await fixture.whenStable();
  });

  it('lazy loads the named public SVG at the requested size', () => {
    const image = (fixture.nativeElement as HTMLElement).querySelector('img');

    expect(image?.getAttribute('src')).toBe('/icons/filters.svg');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.width).toBe(18);
    expect(image?.height).toBe(18);
    expect(image?.alt).toBe('');
  });
});
