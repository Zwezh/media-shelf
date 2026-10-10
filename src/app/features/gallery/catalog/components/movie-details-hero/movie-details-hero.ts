import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { Icon } from '@msh-shared/components/icon/icon';
import { MediaBadge } from '@msh-shared/components/media-badge/media-badge';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import type { TitleDetailsView } from '../../models/title-details-view';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, MediaBadge, RequiresAuth, TranslatePipe],
  selector: 'msh-movie-details-hero',
  styleUrls: ['./movie-details-hero.scss', './movie-details-hero-responsive.scss'],
  templateUrl: './movie-details-hero.html',
})
export class MovieDetailsHero {
  readonly showQuality = input(true);
  readonly movie = input.required<TitleDetailsView>();
  readonly isDeleting = input(false);
  readonly actions = input<readonly ('edit' | 'delete' | 'auxiliary')[]>(['edit', 'delete', 'auxiliary']);
  readonly deleteRequested = output<void>();
  readonly editRequested = output<void>();
  private readonly untitled = translate('media.untitled');
  protected readonly displayTitle = computed(() => this.movie().title || this.untitled());
  protected readonly durationParams = computed(() => ({
    hours: Math.floor((this.movie().durationMinutes ?? 0) / 60),
    minutes: (this.movie().durationMinutes ?? 0) % 60,
  }));
  protected readonly formattedRating = computed(() => this.movie().rating?.toFixed(1) ?? '');
  protected readonly kinopoiskUrl = computed(() => `https://www.kinopoisk.ru/film/${this.movie().kpId}`);

  protected hideFailedBackdrop(event: Event): void {
    (event.target as HTMLImageElement).hidden = true;
  }

  protected usePosterPlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(MEDIA_POSTER_PLACEHOLDER)) {
      image.src = MEDIA_POSTER_PLACEHOLDER;
    }
  }
}
