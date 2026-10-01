import { TestBed } from '@angular/core/testing';
import { IconRegistry } from './icon-registry';

describe('IconRegistry', () => {
  it('loads an icon lazily, caches its source, and returns recolorable clones', async () => {
    const registry = TestBed.inject(IconRegistry);
    const loader = vi.fn(async () => '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="#fff" d="M0 0h16v16H0z" /></svg>');
    registry.register('add', loader);

    const first = await registry.getIcon('add');
    const second = await registry.getIcon('add');

    expect(loader).toHaveBeenCalledOnce();
    expect(first).not.toBe(second);
    expect(first.getAttribute('width')).toBeNull();
    expect(first.getAttribute('height')).toBeNull();
    expect(first.querySelector('path')?.getAttribute('fill')).toBe('currentColor');
    expect(first.getAttribute('focusable')).toBe('false');
  });
});
