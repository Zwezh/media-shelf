import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { toTitle } from '../../catalog/utils/title.converter';
import { SeriesDetailsStore } from '../state/series-details.store';
import { SeriesDetails } from './series-details';

describe('Series details page', () => {
  it('renders supplied season data and announced counts with authenticated mutation controls and no invented metadata', async () => {
    const store = { isDeleting: signal(false), title: signal(toTitle(seriesDto)), status: signal('loaded'), retry: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ...provideI18nTesting(),
        { provide: SettingsStore, useValue: { qualityOptions: signal([]), extensionOptions: signal([]) } },
      ],
    });
    TestBed.overrideComponent(SeriesDetails, { set: { providers: [{ provide: SeriesDetailsStore, useValue: store }] } });
    const fixture = TestBed.createComponent(SeriesDetails);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('h1')).toHaveLength(1);
    expect(element.textContent).toContain('Announced seasons: 3');
    expect(element.textContent).toContain('2020–present');
    expect(element.querySelector('tbody tr')?.textContent).toContain('Specials');
    expect(element.querySelector('.movie-hero__primary-actions')).not.toBeNull();
    expect(
      Array.from(element.querySelectorAll<HTMLButtonElement>('.movie-hero__primary-actions button')).every((button) => button.disabled),
    ).toBe(true);
    expect(element.querySelector('.movie-hero__rating')).toBeNull();
    expect(element.querySelector('a[href="/gallery/series"]')).not.toBeNull();
    store.status.set('error');
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.movie-details__error-actions button')?.click();
    expect(store.retry).toHaveBeenCalledOnce();
    expect(element.querySelector('msh-series-seasons')).toBeNull();
  });
});
