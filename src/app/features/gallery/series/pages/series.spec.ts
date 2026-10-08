import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthSession } from '@msh-core/auth/auth-session';
import { provideAuthSessionTesting, resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { Subject } from 'rxjs';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { toTitle } from '../../catalog/utils/title.converter';
import { DEFAULT_CATALOG_PARAMS } from '../../catalog/models/catalog-params';
import { SeriesStore } from '../state/series.store';
import { Series } from './series';

describe('Series page', () => {
  beforeEach(resetTestAuthStorage);
  afterEach(() => {
    resetTestAuthStorage();
    TestBed.resetTestingModule();
  });
  it('shows always-visible production/count metadata, library actions and preserves the list URL on navigation', async () => {
    const status = signal('loaded');
    const store = {
      isDeleting: signal(false),
      titles: signal([toTitle(seriesDto)]),
      totalCount: signal(1),
      status,
      filters: signal({}),
      activeFilterCount: signal(0),
      params: signal(DEFAULT_CATALOG_PARAMS),
      page: signal(1),
      sorting: signal({ key: DEFAULT_CATALOG_PARAMS.key, direction: DEFAULT_CATALOG_PARAMS.direction }),
      deleteSeries: vi.fn(),
      retry: vi.fn(),
      changePage: vi.fn(),
    };
    const closed = new Subject<boolean | undefined>();
    const open = vi.fn(() => ({ closed }));
    const navigate = vi.fn(() => Promise.resolve(true));
    TestBed.configureTestingModule({
      providers: [
        provideAuthSessionTesting(),
        ...provideI18nTesting(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: { navigate } },
        { provide: FloatingPanel, useValue: { open } },
        { provide: SettingsStore, useValue: { qualityOptions: signal([]) } },
      ],
    });
    TestBed.overrideComponent(Series, { set: { providers: [provideAuthSessionTesting(), { provide: SeriesStore, useValue: store }] } });
    const fixture = TestBed.createComponent(Series);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[card-metadata]')?.textContent).toContain('In production');
    expect(element.querySelector('.media-card__overlay-meta')?.textContent).toContain('Seasons: 1 / 2');
    expect(element.querySelector('[card-metadata]')?.textContent).not.toContain('Seasons:');
    expect(element.querySelector('.series-production-status')?.getAttribute('data-status')).toBe('in_production');
    const actions = element.querySelectorAll<HTMLButtonElement>('.media-card__action');
    expect(actions).toHaveLength(3);
    const addButton = element.querySelector<HTMLButtonElement>('.movies__add-button')!;
    expect(addButton.textContent).toContain('Add series');
    expect(addButton.disabled).toBe(true);
    expect(actions[1].disabled).toBe(true);
    expect(actions[2].disabled).toBe(true);
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    await fixture.whenStable();
    expect(addButton.disabled).toBe(false);
    expect(actions[1].disabled).toBe(false);
    expect(actions[2].disabled).toBe(false);
    addButton.click();
    expect(navigate).toHaveBeenCalledWith(['new'], expect.objectContaining({ queryParamsHandling: 'preserve' }));
    actions[1].click();
    expect(navigate).toHaveBeenCalledWith(['series-1', 'edit'], expect.objectContaining({ queryParamsHandling: 'preserve' }));
    actions[2].click();
    expect(open).toHaveBeenCalledOnce();
    expect(store.deleteSeries).not.toHaveBeenCalled();
    closed.next(true);
    expect(store.deleteSeries).toHaveBeenCalledWith('series-1');
    store.isDeleting.set(true);
    await fixture.whenStable();
    expect(actions[1].disabled).toBe(true);
    expect(actions[2].disabled).toBe(true);
    store.isDeleting.set(false);
    await fixture.whenStable();
    expect(actions[1].disabled).toBe(false);
    expect(actions[2].disabled).toBe(false);

    actions[0].click();
    expect(navigate).toHaveBeenCalledWith(['series-1'], expect.objectContaining({ queryParamsHandling: 'preserve' }));
    status.set('error');
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.movies__error button')?.click();
    expect(store.retry).toHaveBeenCalledOnce();
    expect(element.querySelector('msh-media-card')).toBeNull();
  });
});
