import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import { MoviesSortPanel, type MoviesSortPanelData } from './movies-sort-panel';

describe('MoviesSortPanel', () => {
  function createPanel(data: MoviesSortPanelData) {
    const close = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: FLOATING_PANEL_DATA, useValue: data },
        { provide: FloatingPanelRef, useValue: { close } },
      ],
    });

    return { close, fixture: TestBed.createComponent(MoviesSortPanel) };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('emits desktop direction and field changes immediately', async () => {
    const { fixture } = createPanel({ mode: 'desktop', sorting: { direction: 'desc', key: 'rating' } });
    const changes: unknown[] = [];
    fixture.componentInstance.sortingChange.subscribe((sorting) => changes.push(sorting));
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('[aria-pressed="false"]')?.click();
    await fixture.whenStable();
    element.querySelector<HTMLInputElement>('input[value="year"]')?.click();
    await fixture.whenStable();

    expect(changes).toEqual([
      { direction: 'asc', key: 'rating' },
      { direction: 'asc', key: 'year' },
    ]);
    expect(element.querySelector('label.sort-panel__option--selected')?.textContent).toContain('Year');
  });

  it('keeps mobile changes as a draft until Apply Sorting', async () => {
    const { close, fixture } = createPanel({ mode: 'mobile', sorting: { direction: 'desc', key: 'rating' } });
    const change = vi.fn();
    fixture.componentInstance.sortingChange.subscribe(change);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLInputElement>('input[value="year"]')?.click();
    await fixture.whenStable();

    expect(change).not.toHaveBeenCalled();
    const apply = element.querySelector<HTMLButtonElement>('.sort-panel__apply');
    expect(apply?.disabled).toBe(false);
    apply?.click();

    expect(close).toHaveBeenCalledWith({ direction: 'desc', key: 'year' });
  });

  it('resets a mobile draft to the default sorting', async () => {
    const { close, fixture } = createPanel({ mode: 'mobile', sorting: { direction: 'asc', key: 'year' } });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('.sort-panel__reset')?.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.sort-panel__apply')?.click();

    expect(close).toHaveBeenCalledWith({ direction: 'desc', key: 'addedDate' });
  });
});
