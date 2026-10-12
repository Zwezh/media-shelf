import { NavigationFocus } from '@msh-core/navigation-focus';
import { Language } from '@msh-core/i18n/language';
import { displayTitle } from '@msh-shared/utils/display-title';
import { DatePipe } from '@angular/common';
import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { DetailCard } from '@msh-shared/components/detail-card/detail-card';
import { MediaBadge } from '@msh-shared/components/media-badge/media-badge';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { MovieDetailsHero } from '../../catalog/components/movie-details-hero/movie-details-hero';
import { ProductionAndCast } from '../../catalog/components/production-and-cast/production-and-cast';
import { RelatedMovieLists } from '../../catalog/components/related-movie-lists/related-movie-lists';
import { availableSeasonFormats, formatLabels, seriesYears, toSeriesDetailsView } from '../../catalog/utils/title-display';
import { DeletionConfirmation } from '../../catalog/ui/deletion-confirmation';
import { SeriesSeasons } from '../components/series-seasons';
import { SeriesDetailsStore } from '../state/series-details.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-series-details',
  imports: [
    DatePipe,
    DetailCard,
    MediaBadge,
    MovieDetailsHero,
    PageStatus,
    ProductionAndCast,
    RelatedMovieLists,
    RouterLink,
    SeriesSeasons,
    TranslatePipe,
  ],
  providers: [SeriesDetailsStore],
  templateUrl: './series-details.html',
  styleUrl: './series-details.scss',
})
export class SeriesDetails {
  private readonly navigationFocus = inject(NavigationFocus);
  private readonly router = inject(Router);
  private readonly owner = inject(DestroyRef);
  private readonly deletion = inject(DeletionConfirmation);
  private readonly language = inject(Language).language;
  protected readonly store = inject(SeriesDetailsStore);
  protected readonly breadcrumbTitle = computed(() => displayTitle(this.store.title(), this.language()));
  private readonly settings = inject(SettingsStore);
  private readonly present = translate('series.present');
  private readonly unknown = translate('series.unknown');
  private readonly unknownFormat = translate('series.unknownFormat');
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  protected readonly details = computed(() => {
    const title = this.store.title();
    return title
      ? toSeriesDetailsView(title, this.settings.qualityOptions(), seriesYears(title.series, this.present(), this.unknown()))
      : null;
  });
  protected readonly formats = computed(() =>
    formatLabels(
      availableSeasonFormats(this.store.title()?.series.seasons ?? []),
      this.settings.qualityOptions(),
      this.settings.extensionOptions(),
      this.unknownFormat(),
    ),
  );

  protected edit(id: string): void {
    void this.router.navigate(['/gallery/series', id, 'edit'], { queryParamsHandling: 'preserve' });
  }
  protected confirmDelete(id: string, title: string): void {
    if (this.store.isDeleting()) return;
    this.deletion.confirm({ owner: this.owner, title, collection: 'series' }).subscribe(() => this.store.deleteSeries(id));
  }
  constructor() {
    afterRenderEffect(() => {
      const title = this.store.title();
      if (title) this.navigationFocus.heading(this.content()?.nativeElement.querySelector<HTMLElement>('h1') ?? undefined);
    });
  }
}
