import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { MoviesFilterPanel, type MoviesFilterPanelData } from './movies-filter-panel';

describe('MoviesFilterPanel', () => {
  let fixture: ComponentFixture<MoviesFilterPanel>;
  let data: MoviesFilterPanelData;
  let close: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    close = vi.fn();
    data = { filters: { genres: ['Drama'], rating: 7.5 } };
    TestBed.configureTestingModule({
      imports: [MoviesFilterPanel],
      providers: [
        ...provideI18nTesting(),
        {
          provide: FLOATING_PANEL_DATA,
          useValue: data,
        },
        { provide: FloatingPanelRef, useValue: { close } },
        {
          provide: SettingsStore,
          useValue: {
            genresForFilters: signal(['Action', 'Drama', 'Sci-Fi']),
            qualityOptions: signal([
              { title: '2160p 4K', value: '2160p' },
              { title: '1080p FHD', value: '1080p', default: true },
            ]),
            settings: { error: signal(undefined), isLoading: signal(false) },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(MoviesFilterPanel);
    await fixture.whenStable();
  });

  it('restores applied selections and submits normalized filters', async () => {
    expect(fixture.nativeElement.textContent).toContain('Drama');
    expect(fixture.nativeElement.querySelector('button[aria-pressed="true"]')?.textContent).toContain('Drama');

    clickChoice('Sci-Fi');
    setInput('input[placeholder="Separate names with commas"]', ' Actor One, Actor Two,Actor One ');
    const peopleInputs = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
      'input[placeholder="Separate names with commas"]',
    );
    peopleInputs[1]!.value = ' Director One, Director Two ';
    peopleInputs[1]!.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    fixture.nativeElement.querySelector('form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(close).toHaveBeenCalledWith({
      actors: 'Actor One,Actor Two',
      directors: 'Director One,Director Two',
      genres: ['Drama', 'Sci-Fi'],
      rating: 7.5,
    });
  });

  it('clears draft filters without closing the panel', async () => {
    const resetButton = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.toLowerCase().includes('reset all'),
    );
    resetButton?.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(0);
    expect(close).not.toHaveBeenCalled();
  });

  it('enables apply only while the normalized draft differs from the opened filters', async () => {
    const applyButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.filter-panel__apply');

    expect(applyButton?.disabled).toBe(true);
    expect(applyButton?.querySelector('msh-icon')).toBeNull();

    clickChoice('Drama');
    await fixture.whenStable();
    expect(applyButton?.disabled).toBe(false);

    clickChoice('Drama');
    await fixture.whenStable();
    expect(applyButton?.disabled).toBe(true);
  });

  it('exposes and applies the supported zero-to-ten rating range', async () => {
    const range = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#movies-rating');
    expect(range?.min).toBe('0');
    expect(range?.max).toBe('10');

    if (!range) throw new Error('Missing rating range');
    range.value = '9.5';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(close).toHaveBeenCalledWith(expect.objectContaining({ rating: 9.5 }));
  });

  it('renders backend quality titles and submits their values', async () => {
    expect(fixture.nativeElement.textContent).toContain('1080p FHD');

    clickChoice('1080p FHD');
    await fixture.whenStable();
    fixture.nativeElement.querySelector('form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(close).toHaveBeenCalledWith(expect.objectContaining({ quality: ['1080p'] }));
  });

  function clickChoice(label: string): void {
    const button = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button[aria-pressed]')].find(
      (candidate) => candidate.textContent?.includes(label),
    );
    button?.click();
  }

  function setInput(selector: string, value: string): void {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(selector);
    if (!input) throw new Error(`Missing input: ${selector}`);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  it('rejects release years outside the URL contract bounds', async () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[inputmode="numeric"]')!;
    input.value = '2101';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.filter-panel__apply')?.disabled).toBe(true);
    input.value = '2020';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.filter-panel__apply')?.disabled).toBe(false);
  });
  it('keeps Series-specific controls out of the Movie filter panel', () => {
    expect(fixture.nativeElement.querySelector('select')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('applies, restores and clears Series status and incomplete-season filters', async () => {
    fixture.destroy();
    Object.assign(data, { seriesFilters: true, filters: { productionStatus: 'finished', seasonAvailability: 'incomplete' } });
    fixture = TestBed.createComponent(MoviesFilterPanel);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('select')!;
    const availability = element.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(status.value).toBe('finished');
    expect(availability.checked).toBe(true);
    expect(element.querySelector<HTMLButtonElement>('.filter-panel__apply')!.disabled).toBe(true);
    status.value = 'in_production';
    status.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    element.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(close).toHaveBeenCalledWith({ productionStatus: 'in_production', seasonAvailability: 'incomplete' });
    const remove = [...element.querySelectorAll<HTMLButtonElement>('.filter-panel__active-chip')].find((button) =>
      button.textContent?.includes('In production'),
    )!;
    remove.click();
    await fixture.whenStable();
    expect(status.value).toBe('');
    element.querySelector<HTMLButtonElement>('.filter-panel__reset')!.click();
    await fixture.whenStable();
    expect(availability.checked).toBe(false);
    expect(element.querySelectorAll('.filter-panel__active-chip')).toHaveLength(0);
  });
});
