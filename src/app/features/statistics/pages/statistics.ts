import { NavigationFocus } from '@msh-core/navigation-focus';
import localePl from '@angular/common/locales/pl';
import localeRu from '@angular/common/locales/ru';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { registerLocaleData, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Language } from '@msh-core/i18n/language';
import { AuthSession } from '@msh-core/auth/auth-session';
import { EmptyState } from '@msh-shared/components/empty-state/empty-state';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { Icon } from '@msh-shared/components/icon/icon';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { StatisticsStore } from '../state/statistics.store';
import { StatisticCard } from '../components/statistic-card';
import { StatisticsChartPanel } from '../components/statistics-chart-panel';
import { histogramBars, qualitySegments } from '../utils/statistics-display';
registerLocaleData(localePl);
registerLocaleData(localeRu);

@Component({
  selector: 'msh-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    DatePipe,
    DecimalPipe,
    PercentPipe,
    EmptyState,
    PageStatus,
    Icon,
    RequiresAuth,
    StatisticCard,
    StatisticsChartPanel,
  ],
  providers: [StatisticsStore],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics {
  private readonly navigationFocus = inject(NavigationFocus);
  protected readonly store = inject(StatisticsStore);
  protected readonly locale = inject(Language).language;
  protected readonly authenticated = inject(AuthSession).isAuthenticated;
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  protected readonly quality = computed(() => {
    const snapshot = this.store.snapshot();
    return snapshot ? qualitySegments(snapshot) : [];
  });
  protected readonly years = computed(() => histogramBars(this.store.snapshot()?.decades ?? []));
  protected readonly ratings = computed(() => histogramBars(this.store.snapshot()?.ratings.bins ?? []));
  protected readonly topGenres = computed(() => this.allGenres().slice(0, 8));
  protected readonly allGenres = computed(() => this.store.snapshot()?.genres ?? []);
  constructor() {
    afterNextRender(() => this.navigationFocus.heading(this.heading()?.nativeElement));
  }
}
