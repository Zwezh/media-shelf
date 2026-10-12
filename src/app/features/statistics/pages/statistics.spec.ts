import { signal } from '@angular/core';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideAuthSessionTesting } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { IconRegistry } from '@msh-shared/components/icon/icon-registry';
import { emptyStatistics } from '../testing/statistics.fixture';
import { StatisticsStore } from '../state/statistics.store';
import { Statistics } from './statistics';

describe('Statistics deferred charts', () => {
  const snapshot = signal({
    ...emptyStatistics,
    totals: { ...emptyStatistics.totals, titles: 1, movies: 1 },
    genres: [{ label: 'Drama', count: 1 }],
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Statistics],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideAuthSessionTesting(),
        ...provideI18nTesting(),
        { provide: IconRegistry, useValue: { getIcon: vi.fn(async () => document.createElementNS('http://www.w3.org/2000/svg', 'svg')) } },
      ],
    }).overrideComponent(Statistics, {
      set: { providers: [{ provide: StatisticsStore, useValue: { snapshot, status: signal('ready'), scan: vi.fn() } }] },
    });
    await TestBed.compileComponents();
  });

  it('renders KPIs immediately and loads each chart independently', async () => {
    const fixture = TestBed.createComponent(Statistics);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('msh-statistic-card')).toHaveLength(3);
    expect(element.querySelectorAll('msh-statistics-chart-panel')).toHaveLength(0);
    expect(element.querySelectorAll('.statistics__chart-placeholder')).toHaveLength(4);
    const blocks = await fixture.getDeferBlocks();
    expect(blocks).toHaveLength(4);
    await blocks[0].render(DeferBlockState.Complete);
    await fixture.whenStable();
    expect(element.querySelectorAll('msh-statistics-chart-panel')).toHaveLength(1);
    expect(element.querySelector('.genre-list')?.textContent).toContain('Drama');
    for (const block of blocks.slice(1)) await block.render(DeferBlockState.Complete);
    await fixture.whenStable();
    expect(element.querySelectorAll('msh-statistics-chart-panel')).toHaveLength(4);
    expect(element.querySelectorAll('.statistics__chart-placeholder')).toHaveLength(0);
  });

  it('shows accessible feedback when a chart chunk cannot load', async () => {
    const fixture = TestBed.createComponent(Statistics);
    await fixture.whenStable();
    const [block] = await fixture.getDeferBlocks();
    await block.render(DeferBlockState.Error);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent).toContain('Reload the page');
  });
});
