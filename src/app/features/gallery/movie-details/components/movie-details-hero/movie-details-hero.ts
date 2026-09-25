import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MEDIA_POSTER_PLACEHOLDER } from '@msh-core/config/media';
import { Icon } from '@msh-shared/components/icon/icon';
import { MediaBadge } from '@msh-shared/components/media-badge/media-badge';
import { type MovieDetails } from '../../../models/movie-details';

@Component({
  imports: [Icon, MediaBadge, TranslatePipe],
  selector: 'msh-movie-details-hero',
  styleUrls: ['./movie-details-hero.scss', './movie-details-hero-responsive.scss'],
  templateUrl: './movie-details-hero.html',
})
export class MovieDetailsHero {
  readonly movie = input.required<MovieDetails>();
  protected readonly durationParams = computed(() => ({
    hours: Math.floor(this.movie().durationMinutes / 60),
    minutes: this.movie().durationMinutes % 60,
  }));
  protected readonly formattedRating = computed(() => this.movie().rating.toFixed(1));
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
