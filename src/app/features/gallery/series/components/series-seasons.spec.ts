import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { SeriesSeasons } from './series-seasons';

describe('SeriesSeasons', () => {
  it('sorts seasons, includes specials and distinguishes availability from recorded formats', async () => {
    const qualityOptions = signal<{ id: string; title: string; value: string }[]>([]);
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: SettingsStore, useValue: { qualityOptions, extensionOptions: signal([{ id: 'extension-1', value: 'mkv' }]) } },
      ],
    });
    const fixture = TestBed.createComponent(SeriesSeasons);
    const seasons = seriesDto.series.seasons.map((season) => ({ ...season, formats: seriesDto.series.seasons[0].formats })).reverse();
    fixture.componentRef.setInput('seasons', seasons);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const rows = element.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Specials (season 0)');
    expect(rows[0].textContent).toContain('Unknown format · mkv');
    expect(rows[0].textContent).toContain('Available');
    expect(rows[1].textContent).toContain('Unavailable');
    expect(rows[1].textContent).toContain('No formats recorded');
    expect(seasons[0].seasonNumber).toBe(1);
    qualityOptions.set([{ id: 'quality-1', title: '4K', value: '2160p' }]);
    await fixture.whenStable();
    expect(element.querySelector('tbody tr')?.textContent).toContain('4K · mkv');
    fixture.componentRef.setInput('seasons', []);
    await fixture.whenStable();
    expect(element.querySelector('table')).toBeNull();
    expect(element.textContent).toContain('No season information');
  });
});
