import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { MoviesSortSelect } from './movies-sort-select';

describe('MoviesSortSelect', () => {
  afterEach(() => {
    document.querySelectorAll('msh-floating-panel-host').forEach((host) => host.remove());
    TestBed.resetTestingModule();
  });

  it('opens an accessible anchored panel and restores its closed state', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(MoviesSortSelect);
    fixture.componentRef.setInput('sorting', { direction: 'desc', key: 'rating' });
    await fixture.whenStable();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button');
    expect(trigger?.textContent).toContain('Sort by: Rating');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    trigger?.focus();
    trigger?.click();
    await fixture.whenStable();

    expect(document.querySelector('dialog.floating-panel--anchored-responsive')).not.toBeNull();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    document.querySelector<HTMLButtonElement>('.sort-panel__header button')?.click();
    await fixture.whenStable();

    expect(document.querySelector('dialog.floating-panel--anchored-responsive')).toBeNull();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });
});
