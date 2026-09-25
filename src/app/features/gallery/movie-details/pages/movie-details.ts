import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { AdditionalInformation } from '../components/additional-information/additional-information';
import { MovieDetailsHero } from '../components/movie-details-hero/movie-details-hero';
import { ProductionAndCast } from '../components/production-and-cast/production-and-cast';
import { RelatedMovieLists } from '../components/related-movie-lists/related-movie-lists';
import { MovieDetailsStore } from '../state/movie-details.store';

@Component({
  imports: [AdditionalInformation, MovieDetailsHero, PageStatus, ProductionAndCast, RelatedMovieLists, RouterLink, TranslatePipe],
  providers: [MovieDetailsStore],
  selector: 'msh-movie-details',
  styleUrl: './movie-details.scss',
  templateUrl: './movie-details.html',
})
export class MovieDetailsPage {
  protected readonly store = inject(MovieDetailsStore);
  protected readonly breadcrumbTitle = computed(() => this.store.movie()?.title ?? '');
}
