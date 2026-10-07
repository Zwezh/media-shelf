import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { type MovieDetails } from '../../../models/movie-details';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  selector: 'msh-related-movie-lists',
  styleUrl: './related-movie-lists.scss',
  templateUrl: './related-movie-lists.html',
})
export class RelatedMovieLists {
  readonly similarTitleKey = input('movieDetails.related.similarMovies');
  readonly movie = input.required<Pick<MovieDetails, 'similarMovies' | 'sequelsAndPrequels'>>();
}
