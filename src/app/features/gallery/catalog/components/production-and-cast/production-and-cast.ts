import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DetailCard } from '@msh-shared/components/detail-card/detail-card';
import { type MovieDetails } from '../../../models/movie-details';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailCard, TranslatePipe],
  selector: 'msh-production-and-cast',
  styleUrl: './production-and-cast.scss',
  templateUrl: './production-and-cast.html',
})
export class ProductionAndCast {
  readonly movie = input.required<Pick<MovieDetails, 'countries' | 'directors' | 'actors' | 'year'>>();
  protected readonly countries = computed(() => this.movie().countries.join(', '));
  protected readonly directors = computed(() => this.movie().directors.join(', '));
}
